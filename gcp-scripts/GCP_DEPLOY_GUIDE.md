# TechStore — GCP Deploy කරන්නේ කොහොමද
# ITS 2130 — Step by Step Guide (සිංහල)
# ══════════════════════════════════════════════════════

## OVERVIEW — කොහොමද deploy කරන්නේ?

Deploy කරන order එක:
1.  VS Code වල project build කරන්න (JAR files)
2.  GCP Console open කරන්න
3.  Infrastructure හදන්න (VPC, VMs, etc.)
4.  JAR files VMs වලට copy කරන්න
5.  PM2 වලින් start කරන්න
6.  Config files update කරන්න (IPs replace)
7.  Frontend deploy කරන්න

═══════════════════════════════════════════════
## PHASE 1 — LOCAL: JAR FILES BUILD කරන්න
═══════════════════════════════════════════════

VS Code terminal (Ctrl+`) open කරලා හැම service folder එකේ run කරන්න:

```bash
# Config Server
cd config-server
mvn clean package -DskipTests
# → target/config-server-1.0.0.jar හැදෙනවා

# Eureka Server
cd ../eureka-server
mvn clean package -DskipTests

# API Gateway
cd ../api-gateway
mvn clean package -DskipTests

# User Service
cd ../user-service
mvn clean package -DskipTests

# Product Service
cd ../product-service
mvn clean package -DskipTests

# Media Service
cd ../media-service
mvn clean package -DskipTests
```

ඔක්කොම JAR files: target/ folder එකේ

═══════════════════════════════════════════════
## PHASE 2 — GCP: PROJECT SETUP
═══════════════════════════════════════════════

1. https://console.cloud.google.com/ open කරන්න
2. New Project හදන්න: "techstore-project"
3. Project ID note කරගන්න (example: techstore-project-123456)
4. Billing enable කරන්න (Credit card ඕන — Free tier available)

═══════════════════════════════════════════════
## PHASE 3 — GCP: VPC NETWORK
═══════════════════════════════════════════════

GCP Console → VPC Network → Create VPC:
  Name: techstore-vpc
  Subnet mode: Custom
  
  Subnet:
    Name: techstore-subnet
    Region: us-central1
    IP range: 10.0.0.0/24

═══════════════════════════════════════════════
## PHASE 4 — GCP: FIREWALL RULES
═══════════════════════════════════════════════

VPC Network → Firewall → Create Firewall Rule:

Rule 1 — Internal:
  Name: techstore-allow-internal
  Network: techstore-vpc
  Targets: All instances
  Source IP: 10.0.0.0/24
  Protocols: tcp, udp, icmp

Rule 2 — Services:
  Name: techstore-allow-services
  Network: techstore-vpc
  Targets: techstore-services (tag)
  Source IP: 0.0.0.0/0
  TCP Ports: 8080, 8081, 8082, 8083, 8761, 8888, 22

Rule 3 — Health Checks:
  Name: techstore-allow-health
  Source IP: 130.211.0.0/22, 35.191.0.0/16
  All TCP

═══════════════════════════════════════════════
## PHASE 5 — GCP: CLOUD SQL
═══════════════════════════════════════════════

SQL → Create Instance → MySQL:
  Instance ID: techstore-mysql
  Password: TechStore@2024
  Version: MySQL 8.0
  Region: us-central1
  Machine type: Shared core (cheapest)
  
  Connections tab:
    Private IP: Enable
    Network: techstore-vpc
  
  Create!

After create:
  → Note the PRIVATE IP (example: 10.0.0.3)
  → Create database: techstore_user_db
  → Create user: techstore_user / TechStore@2024

═══════════════════════════════════════════════
## PHASE 6 — GCP: CLOUD STORAGE
═══════════════════════════════════════════════

Cloud Storage → Create Bucket:
  Name: techstore-media-bucket (globally unique!)
  Location: us-central1
  Storage class: Standard
  Access: Fine-grained
  
After create:
  → Permissions → Add: allUsers → Storage Object Viewer

═══════════════════════════════════════════════
## PHASE 7 — GCP: FIRESTORE
═══════════════════════════════════════════════

Firestore → Create Database:
  Mode: Native mode
  Location: us-central1

(MongoDB වෙනුවට Firestore use කරනවා GCP production deploy වලදී)

NOTE: Local development/testing:
  MongoDB use කරනවා (product-service config.yml update කරන්න)

═══════════════════════════════════════════════
## PHASE 8 — GCP: PLATFORM VMs (Eureka, Config, Gateway)
═══════════════════════════════════════════════

Compute Engine → VM Instances → Create Instance:

VM 1 — Platform (Zone A):
  Name: techstore-platform-a
  Region: us-central1 / Zone: us-central1-a
  Machine type: e2-medium
  OS: Ubuntu 22.04 LTS
  Disk: 20GB
  Network: techstore-vpc / techstore-subnet
  Network tags: techstore-services
  Service account: Compute Engine default (has Storage access)

VM 2 — Platform (Zone B):
  Same settings, Zone: us-central1-b
  Name: techstore-platform-b

═══════════════════════════════════════════════
## PHASE 9 — JAVA 25 INSTALL (Each VM)
═══════════════════════════════════════════════

VM SSH → Terminal:

```bash
# Java 25 manually install
sudo apt-get update
sudo apt-get install -y curl wget

# Oracle JDK 25 download (or use early access)
wget https://download.java.net/java/early_access/jdk25/latest/GPL/openjdk-25-ea+latest_linux-x64_bin.tar.gz
sudo tar -xvf openjdk-25-ea+latest_linux-x64_bin.tar.gz -C /opt/
sudo mv /opt/jdk-25* /opt/jdk-25

# Set JAVA_HOME
echo 'export JAVA_HOME=/opt/jdk-25' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

java -version   # java 25 confirm

# Node + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Directories
sudo mkdir -p /opt/techstore /var/log/pm2
sudo chown $USER:$USER /opt/techstore /var/log/pm2
```

═══════════════════════════════════════════════
## PHASE 10 — CONFIG FILES UPDATE කරන්න
═══════════════════════════════════════════════

config-repo/ folder:

user-service.yml:
  url: jdbc:mysql://[CLOUD_SQL_PRIVATE_IP]:3306/techstore_user_db
  defaultZone: http://[EUREKA_VM_INTERNAL_IP]:8761/eureka/

product-service.yml:
  uri: mongodb://[MONGO_VM_IP]:27017/techstore_products
  defaultZone: http://[EUREKA_VM_INTERNAL_IP]:8761/eureka/

media-service.yml:
  project-id: [YOUR_GCP_PROJECT_ID]
  bucket-name: techstore-media-bucket
  defaultZone: http://[EUREKA_VM_INTERNAL_IP]:8761/eureka/

api-gateway.yml:
  defaultZone: http://[EUREKA_VM_INTERNAL_IP]:8761/eureka/

user-service/src/main/resources/application.yml:
  http://[CONFIG_SERVER_VM_INTERNAL_IP]:8888

(product-service, media-service, api-gateway same)

═══════════════════════════════════════════════
## PHASE 11 — JAR FILES UPLOAD TO VMs
═══════════════════════════════════════════════

Local VS Code terminal:

```bash
# JAR files VM වලට copy කරන්න
# (GCP Console → VM → SSH → Upload file button use කරන්නත් පුළුවන්)

# Cloud Shell use:
gcloud compute scp user-service/target/user-service-1.0.0.jar \
  techstore-platform-a:/opt/techstore/ --zone=us-central1-a

gcloud compute scp product-service/target/product-service-1.0.0.jar \
  techstore-platform-a:/opt/techstore/ --zone=us-central1-a

# (Same for all JARs)
```

EASY METHOD: GCP Console → VM Instance → SSH button → 
  Top right gear icon → Upload File

═══════════════════════════════════════════════
## PHASE 12 — PM2 START කරන්න
═══════════════════════════════════════════════

VM SSH terminal:

```bash
# ecosystem.config.js copy කරන්න /opt/techstore/ වලට
cd /opt/techstore

# Platform VM (config + eureka + gateway):
pm2 start ecosystem.config.js --only config-server
# 30 seconds wait...
pm2 start ecosystem.config.js --only eureka-server
# 30 seconds wait...
pm2 start ecosystem.config.js --only api-gateway

# Microservice VMs:
pm2 start ecosystem.config.js --only user-service
pm2 start ecosystem.config.js --only product-service
pm2 start ecosystem.config.js --only media-service

# Save + Startup
pm2 save
pm2 startup
# (output command copy කරලා run කරන්න)

# Check
pm2 monit          ← screen recording වෙනුවෙන් මේක screenshot/record!
pm2 list
pm2 logs
```

═══════════════════════════════════════════════
## PHASE 13 — INSTANCE GROUPS (Auto-Scaling)
═══════════════════════════════════════════════

Compute Engine → Instance Groups → Create Managed Group:

User Service Group:
  Name: techstore-user-service-group
  Template: techstore-template (create with user-service JAR)
  Min replicas: 2
  Max replicas: 5
  Zones: us-central1-a, us-central1-b

Same for product-service-group, media-service-group

═══════════════════════════════════════════════
## PHASE 14 — LOAD BALANCER
═══════════════════════════════════════════════

Network Services → Load Balancing → Create:
  Type: HTTP(S) Load Balancing
  Internet-facing: Yes
  
  Backend:
    Backend service → Instance groups add කරන්න
    Health check: /actuator/health (port 8080)
  
  Frontend:
    Protocol: HTTP
    Port: 80
  
  Create! → IP address note කරගන්න

═══════════════════════════════════════════════
## PHASE 15 — CLOUD DNS (Optional)
═══════════════════════════════════════════════

Network Services → Cloud DNS → Create Zone:
  Name: techstore-zone
  DNS: techstore.example.com
  
  A record: @ → Load Balancer IP

═══════════════════════════════════════════════
## PHASE 16 — FRONTEND UPDATE & DEPLOY
═══════════════════════════════════════════════

frontend/index.html:
  Config tab → Gateway URL: http://[LOAD_BALANCER_IP]

Frontend hosting options:
  1. Cloud Storage bucket (static hosting)
  2. VM এ Nginx
  3. Local computer থেকে open করুন

═══════════════════════════════════════════════
## PHASE 17 — README UPDATE
═══════════════════════════════════════════════

techstore-main/README.md:
  Eureka URL: http://[EUREKA_VM_EXTERNAL_IP]:8761

⚠️ MANDATORY — lecturer marks check করে!

═══════════════════════════════════════════════
## PHASE 18 — SCREEN RECORDING
═══════════════════════════════════════════════

Record কিরতে হবে:
1. GCP Console → All resources (VMs, SQL, Storage, etc.)
2. Each VM → SSH → pm2 monit command
3. All IP addresses match করতে হবে

pm2 monit command:
  ┌─ user-service    ● online │ cpu: 2% │ mem: 256mb
  ├─ product-service ● online │ cpu: 1% │ mem: 210mb
  └─ media-service   ● online │ cpu: 1% │ mem: 198mb

═══════════════════════════════════════════════
## GITHUB SUBMODULES SETUP
═══════════════════════════════════════════════

```bash
# Create 7 repositories on GitHub first, then:

git init techstore-main
cd techstore-main

git submodule add https://github.com/YOUR_USERNAME/config-server.git
git submodule add https://github.com/YOUR_USERNAME/eureka-server.git
git submodule add https://github.com/YOUR_USERNAME/api-gateway.git
git submodule add https://github.com/YOUR_USERNAME/user-service.git
git submodule add https://github.com/YOUR_USERNAME/product-service.git
git submodule add https://github.com/YOUR_USERNAME/media-service.git
git submodule add https://github.com/YOUR_USERNAME/frontend.git

git add .
git commit -m "Initial commit with all submodules"
git push origin main
```

SUBMIT: techstore-main repository link

═══════════════════════════════════════════════
## IMPORTANT IP REPLACEMENTS CHECKLIST
═══════════════════════════════════════════════

Replace these in config files:

[ ] YOUR_CONFIG_SERVER_IP  → Platform VM internal IP (10.0.0.x)
[ ] YOUR_EUREKA_VM_IP      → Eureka VM internal IP (10.0.0.x)
[ ] YOUR_EUREKA_VM_EXTERNAL_IP → Eureka VM external IP (for README)
[ ] YOUR_CLOUD_SQL_IP      → Cloud SQL private IP
[ ] YOUR_MONGO_VM_IP       → MongoDB VM IP (if separate VM)
[ ] YOUR_GCP_PROJECT_ID    → GCP project ID
[ ] YOUR_LOAD_BALANCER_IP  → LB external IP (for frontend)
[ ] YOUR_USERNAME          → GitHub username

═══════════════════════════════════════════════
## QUICK COMMANDS REFERENCE
═══════════════════════════════════════════════

PM2 commands (on VM):
  pm2 list          # processes ලිස්ට්
  pm2 monit         # live monitoring (SCREEN RECORD THIS!)
  pm2 logs          # all logs
  pm2 restart all   # restart
  pm2 stop all      # stop
  pm2 save          # save process list
  pm2 startup       # enable on reboot

Test service (from VM):
  curl http://localhost:8081/users/health
  curl http://localhost:8082/products/health
  curl http://localhost:8083/media/health

Test via Gateway:
  curl http://GATEWAY_IP:8080/api/users/health
