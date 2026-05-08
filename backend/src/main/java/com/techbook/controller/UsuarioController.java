package com.techbook.controller;

import com.techbook.dto.ClienteRequest;
import com.techbook.dto.EmprestimoResponse;
import com.techbook.dto.ReservaResponse;
import com.techbook.dto.UsuarioResponse;
import com.techbook.service.TechbookService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
public class UsuarioController {

    private final TechbookService service;

    public UsuarioController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponse> listarTodos() {
        return service.listarClientes();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse cadastrar(@RequestBody ClienteRequest request) {
        return service.criarCliente(request);
    }

    @GetMapping("/{clienteId}/reservas")
    public List<ReservaResponse> listarReservas(@PathVariable Long clienteId) {
        return service.listarReservasDoCliente(clienteId);
    }

    @GetMapping("/{clienteId}/emprestimos")
    public List<EmprestimoResponse> listarEmprestimos(@PathVariable Long clienteId) {
        return service.listarEmprestimosDoCliente(clienteId);
    }
}
