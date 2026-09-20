package com.example.tts.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DATABASE_URL:jdbc:h2:mem:ttsdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE}}")
    private String dbUrl;

    @Value("${spring.datasource.username:sa}")
    private String dbUsername;

    @Value("${spring.datasource.password:password}")
    private String dbPassword;

    @Value("${spring.datasource.driver-class-name:}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String finalUrl = dbUrl;
        String username = dbUsername;
        String password = dbPassword;

        // Strip AUTO_SERVER=TRUE if present
        if (finalUrl.contains("AUTO_SERVER=TRUE")) {
            finalUrl = finalUrl.replace(";AUTO_SERVER=TRUE", "").replace("AUTO_SERVER=TRUE;", "");
        }

        // Automatically convert Render/Heroku/Supabase postgres:// or postgresql:// URLs to valid JDBC format
        if (finalUrl.startsWith("postgres://") || finalUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(finalUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                finalUrl = "jdbc:postgresql://" + host + ":" + port + path;

                // Append query params or sslmode=require if missing for cloud PostgreSQL
                if (query != null && !query.isBlank()) {
                    finalUrl += "?" + query;
                } else if (!finalUrl.contains("sslmode=")) {
                    finalUrl += "?sslmode=require";
                }

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }
                config.setDriverClassName("org.postgresql.Driver");
                log.info("Converted postgres URI to JDBC URL: {}", finalUrl);
            } catch (Exception e) {
                log.error("Failed to parse postgres URL: {}", finalUrl, e);
            }
        } else if (finalUrl.startsWith("jdbc:postgresql:")) {
            config.setDriverClassName("org.postgresql.Driver");
            // Automatically append sslmode=require for Render external postgres if missing
            if (!finalUrl.contains("sslmode=") && (finalUrl.contains("render.com") || finalUrl.contains("supabase") || finalUrl.contains("neon"))) {
                finalUrl += (finalUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
        } else if (finalUrl.startsWith("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
        }

        if (driverClassName != null && !driverClassName.isBlank()) {
            config.setDriverClassName(driverClassName);
        }

        config.setJdbcUrl(finalUrl);
        config.setUsername(username);
        config.setPassword(password);

        // Prevent hanging on database connection failures in containerized environments
        config.setConnectionTimeout(10000); // 10 seconds timeout
        config.setInitializationFailTimeout(10000); // Fail fast after 10s if DB unreachable

        log.info("Initializing DataSource with URL: {}", finalUrl.replaceAll("password=([^&]*)", "password=***"));
        return new HikariDataSource(config);
    }
}
