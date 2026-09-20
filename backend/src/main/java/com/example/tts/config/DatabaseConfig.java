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

    @Value("${spring.datasource.url:${DATABASE_URL:jdbc:h2:file:./data/ttsdb;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE}}")
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

        // Automatically convert Render/Heroku postgres:// or postgresql:// URLs to valid JDBC format
        if (finalUrl.startsWith("postgres://") || finalUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(finalUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();

                finalUrl = "jdbc:postgresql://" + host + ":" + port + path;
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
        } else if (finalUrl.startsWith("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
        }

        if (driverClassName != null && !driverClassName.isBlank()) {
            config.setDriverClassName(driverClassName);
        }

        config.setJdbcUrl(finalUrl);
        config.setUsername(username);
        config.setPassword(password);

        return new HikariDataSource(config);
    }
}
