package techbook.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import techbook.dto.DashboardResponse;
import techbook.service.TechbookService;

@RestController
@RequestMapping("/api/administracao")
public class AdministracaoController {

    private final TechbookService service;

    public AdministracaoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return service.dashboard();
    }
}
