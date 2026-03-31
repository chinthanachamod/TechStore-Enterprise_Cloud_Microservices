package com.techstore.media.config;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GcsConfig {

    @Value("${gcs.project-id}")
    private String projectId;

    /**
     * When run in GCP VM, Application Default Credentials (ADC)
     * automatically using the VM service account.
     * Local development: set the GOOGLE_APPLICATION_CREDENTIALS env variable.
     */
    @Bean
    public Storage googleCloudStorage() {
        return StorageOptions.newBuilder()
                .setProjectId(projectId)
                .build()
                .getService();
    }
}
