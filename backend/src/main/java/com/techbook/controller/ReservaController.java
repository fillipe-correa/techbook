package com.techbook.controller;

import com.techbook.dto.ReservaRequest;
import com.techbook.dto.ReservaResponse;
import com.techbook.service.TechbookService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final TechbookService service;

    public ReservaController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReservaResponse> listar() {
        return service.listarReservas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponse criar(@RequestBody ReservaRequest request) {
        return service.criarReserva(request);
    }

    @PatchMapping("/{id}/cancelar")
    public ReservaResponse cancelar(@PathVariable Long id) {
        return service.cancelarReserva(id);
    }
}
