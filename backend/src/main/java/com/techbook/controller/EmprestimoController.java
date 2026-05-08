package com.techbook.controller;

import com.techbook.dto.ConfirmarRetiradaRequest;
import com.techbook.dto.DevolucaoRequest;
import com.techbook.dto.EmprestimoResponse;
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
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final TechbookService service;

    public EmprestimoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmprestimoResponse> listar() {
        return service.listarEmprestimos();
    }

    @PostMapping("/confirmar-retirada")
    @ResponseStatus(HttpStatus.CREATED)
    public EmprestimoResponse confirmarRetirada(@RequestBody ConfirmarRetiradaRequest request) {
        return service.confirmarRetirada(request);
    }

    @PatchMapping("/{id}/renovar")
    public EmprestimoResponse renovar(@PathVariable Long id) {
        return service.renovarEmprestimo(id);
    }

    @PostMapping("/devolucoes")
    @ResponseStatus(HttpStatus.CREATED)
    public EmprestimoResponse devolver(@RequestBody DevolucaoRequest request) {
        return service.registrarDevolucao(request);
    }
}
