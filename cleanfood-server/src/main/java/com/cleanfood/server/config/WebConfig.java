package com.cleanfood.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path currentDirUpload = Paths.get("uploads").toAbsolutePath().normalize();
        Path parentDirUpload = Paths.get("..", "uploads").toAbsolutePath().normalize();

        List<String> resourceLocations = new ArrayList<>();
        resourceLocations.add("file:" + currentDirUpload + "/");
        if (!parentDirUpload.equals(currentDirUpload)) {
            resourceLocations.add("file:" + parentDirUpload + "/");
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocations.toArray(new String[0]));
    }
}
