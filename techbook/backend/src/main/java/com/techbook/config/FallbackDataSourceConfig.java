package com.techbook.config;

import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

@Configuration
public class FallbackDataSourceConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(FallbackDataSourceConfig.class);

    @Bean
    @Primary
    DataSource dataSource(Environment environment) {
        HikariDataSource mysql = createDataSource(
            environment.getProperty("techbook.datasource.mysql.url"),
            environment.getProperty("techbook.datasource.mysql.driver-class-name"),
            environment.getProperty("techbook.datasource.mysql.username"),
            environment.getProperty("techbook.datasource.mysql.password")
        );

        if (isReachable(mysql)) {
            LOGGER.info("Usando MySQL do MAMP como banco principal.");
            return mysql;
        }

        closeQuietly(mysql);

        HikariDataSource h2 = createDataSource(
            environment.getProperty("techbook.datasource.h2.url"),
            environment.getProperty("techbook.datasource.h2.driver-class-name"),
            environment.getProperty("techbook.datasource.h2.username"),
            environment.getProperty("techbook.datasource.h2.password")
        );

        LOGGER.warn("MySQL do MAMP indisponivel. Aplicacao iniciada com H2 em memoria.");
        return h2;
    }

    private HikariDataSource createDataSource(String url, String driverClassName, String username, String password) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setDriverClassName(driverClassName);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setMaximumPoolSize(5);
        dataSource.setConnectionTimeout(2000);
        return dataSource;
    }

    private boolean isReachable(HikariDataSource dataSource) {
        try (Connection ignored = dataSource.getConnection()) {
            return true;
        } catch (SQLException exception) {
            LOGGER.warn("Falha ao conectar no MySQL do MAMP: {}", exception.getMessage());
            return false;
        }
    }

    private void closeQuietly(HikariDataSource dataSource) {
        try {
            dataSource.close();
        } catch (Exception ignored) {
            // Nada a fazer aqui.
        }
    }
}
