package com.techbook.controller;

import com.techbook.dto.DashboardResponse;
import com.techbook.service.TechbookService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/administracao")
public class AdministracaoController {

    private final TechbookService service;

    public AdministracaoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.buscarDashboard();
    }
}
