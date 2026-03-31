#!/bin/bash
# ══════════════════════════════════════════════════════════════════
# TechStore — GCP Infrastructure Setup Script
# ITS 2130 Enterprise Cloud Architecture
# ══════════════════════════════════════════════════════════════════
# 
# STEP 1: මේ values ඔයාගේ GCP project details වලට replace කරන්න
# STEP 2: GCP Cloud Shell එකේ run කරන්න
# ══════════════════════════════════════════════════════════════════

PROJECT_ID="your-gcp-project-id"       # ← replace
REGION="us-central1"
ZONE_A="us-central1-a"
ZONE_B="us-central1-b"
ZONE_C="us-central1-c"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TechStore GCP Setup Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 0. Set Project ──────────────────────────────────────────────
gcloud config set project $PROJECT_ID
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable dns.googleapis.com
echo "✅ APIs enabled"

# ── 1. VPC Network & Subnets ───────────────────────────────────
gcloud compute networks create techstore-vpc \
  --subnet-mode=custom \
  --description="TechStore VPC Network"

gcloud compute networks subnets create techstore-subnet \
  --network=techstore-vpc \
  --region=$REGION \
  --range=10.0.0.0/24 \
  --description="TechStore main subnet"

echo "✅ VPC and subnet created"

# ── 2. Firewall Rules ──────────────────────────────────────────
# Internal communication
gcloud compute firewall-rules create techstore-allow-internal \
  --network=techstore-vpc \
  --allow=tcp,udp,icmp \
  --source-ranges=10.0.0.0/24 \
  --description="Allow internal VPC communication"

# HTTP for services
gcloud compute firewall-rules create techstore-allow-services \
  --network=techstore-vpc \
  --allow=tcp:8080,tcp:8081,tcp:8082,tcp:8083,tcp:8761,tcp:8888 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=techstore-services \
  --description="Allow service ports"

# SSH
gcloud compute firewall-rules create techstore-allow-ssh \
  --network=techstore-vpc \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=techstore-services \
  --description="Allow SSH"

# Health checks from GCP
gcloud compute firewall-rules create techstore-allow-health \
  --network=techstore-vpc \
  --allow=tcp \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \
  --target-tags=techstore-services \
  --description="Allow GCP health checks"

echo "✅ Firewall rules created"

# ── 3. Cloud Router + NAT ──────────────────────────────────────
gcloud compute routers create techstore-router \
  --network=techstore-vpc \
  --region=$REGION \
  --description="TechStore Cloud Router"

gcloud compute routers nats create techstore-nat \
  --router=techstore-router \
  --region=$REGION \
  --auto-allocate-nat-external-ips \
  --nat-all-subnet-ip-ranges \
  --enable-logging

echo "✅ Cloud NAT and Router created"

# ── 4. Cloud SQL (MySQL) ───────────────────────────────────────
gcloud sql instances create techstore-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=$REGION \
  --network=projects/$PROJECT_ID/global/networks/techstore-vpc \
  --no-assign-ip \
  --storage-size=10GB \
  --storage-auto-increase

gcloud sql databases create techstore_user_db \
  --instance=techstore-mysql

gcloud sql users create techstore_user \
  --instance=techstore-mysql \
  --password=TechStore@2024

echo "✅ Cloud SQL created"
echo "   Get Cloud SQL private IP:"
echo "   gcloud sql instances describe techstore-mysql --format='value(ipAddresses[0].ipAddress)'"

# ── 5. Cloud Storage Bucket ────────────────────────────────────
gsutil mb -p $PROJECT_ID -l $REGION gs://techstore-media-bucket
gsutil iam ch allUsers:objectViewer gs://techstore-media-bucket
gsutil cors set - gs://techstore-media-bucket << 'EOF'
[{"origin":["*"],"method":["GET","POST","DELETE"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]
EOF

echo "✅ Cloud Storage bucket created: techstore-media-bucket"

# ── 6. Health Checks ───────────────────────────────────────────
gcloud compute health-checks create http techstore-hc-gateway \
  --port=8080 \
  --request-path=/actuator/health \
  --check-interval=30s \
  --timeout=10s \
  --healthy-threshold=2 \
  --unhealthy-threshold=3

gcloud compute health-checks create http techstore-hc-eureka \
  --port=8761 \
  --request-path=/actuator/health \
  --check-interval=30s \
  --timeout=10s

echo "✅ Health checks created"

# ── 7. Startup Script for VMs ─────────────────────────────────
cat > /tmp/startup.sh << 'STARTUP'
#!/bin/bash
set -e

# Java 21 install (Java 25 manually install — see GCP_DEPLOY_GUIDE.md)
apt-get update -y
apt-get install -y openjdk-21-jdk curl

# Node.js + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# App directories
mkdir -p /opt/techstore /var/log/pm2

echo "VM startup script completed" > /var/log/startup.log
STARTUP

echo "✅ Startup script prepared"

# ── 8. VM Instance Template ────────────────────────────────────
gcloud compute instance-templates create techstore-template \
  --machine-type=e2-medium \
  --network=techstore-vpc \
  --subnet=techstore-subnet \
  --region=$REGION \
  --tags=techstore-services \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --metadata-from-file=startup-script=/tmp/startup.sh \
  --scopes=cloud-platform \
  --description="TechStore microservice VM template"

echo "✅ VM Instance Template created"

# ── 9. Managed Instance Groups (Auto-Scaling) ──────────────────
# User Service Group
gcloud compute instance-groups managed create techstore-user-service-group \
  --template=techstore-template \
  --size=2 \
  --zones=$ZONE_A,$ZONE_B \
  --instance-redistribution-type=BALANCED

gcloud compute instance-groups managed set-autoscaling techstore-user-service-group \
  --region=$REGION \
  --min-num-replicas=2 \
  --max-num-replicas=5 \
  --target-cpu-utilization=0.6 \
  --cool-down-period=90

# Product Service Group
gcloud compute instance-groups managed create techstore-product-service-group \
  --template=techstore-template \
  --size=2 \
  --zones=$ZONE_A,$ZONE_B \
  --instance-redistribution-type=BALANCED

gcloud compute instance-groups managed set-autoscaling techstore-product-service-group \
  --region=$REGION \
  --min-num-replicas=2 \
  --max-num-replicas=5 \
  --target-cpu-utilization=0.6 \
  --cool-down-period=90

# Media Service Group
gcloud compute instance-groups managed create techstore-media-service-group \
  --template=techstore-template \
  --size=2 \
  --zones=$ZONE_A,$ZONE_B \
  --instance-redistribution-type=BALANCED

gcloud compute instance-groups managed set-autoscaling techstore-media-service-group \
  --region=$REGION \
  --min-num-replicas=2 \
  --max-num-replicas=5 \
  --target-cpu-utilization=0.6 \
  --cool-down-period=90

echo "✅ Instance Groups with Auto-Scaling created"

# ── 10. Platform VMs (Eureka, Config, Gateway) ─────────────────
# Platform services multiple instances — different zones
gcloud compute instances create techstore-platform-a \
  --machine-type=e2-medium \
  --zone=$ZONE_A \
  --network=techstore-vpc \
  --subnet=techstore-subnet \
  --tags=techstore-services \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --scopes=cloud-platform \
  --metadata-from-file=startup-script=/tmp/startup.sh

gcloud compute instances create techstore-platform-b \
  --machine-type=e2-medium \
  --zone=$ZONE_B \
  --network=techstore-vpc \
  --subnet=techstore-subnet \
  --tags=techstore-services \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --scopes=cloud-platform \
  --metadata-from-file=startup-script=/tmp/startup.sh

echo "✅ Platform VMs created in multiple zones (HA)"

# ── 11. Load Balancer ──────────────────────────────────────────
# Backend service
gcloud compute backend-services create techstore-backend \
  --protocol=HTTP \
  --port-name=http \
  --health-checks=techstore-hc-gateway \
  --global

# URL map
gcloud compute url-maps create techstore-url-map \
  --default-service=techstore-backend

# HTTP proxy
gcloud compute target-http-proxies create techstore-http-proxy \
  --url-map=techstore-url-map

# Global forwarding rule
gcloud compute forwarding-rules create techstore-frontend-rule \
  --global \
  --target-http-proxy=techstore-http-proxy \
  --ports=80

echo "✅ Load Balancer created"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Get your Cloud SQL IP and update config files"
echo "2. Build JARs: mvn clean package -DskipTests"
echo "3. Upload JARs to VMs"
echo "4. Start with PM2"
echo "5. Get Load Balancer IP for frontend"
