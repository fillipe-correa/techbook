package techbook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import techbook.dto.ConfirmarRetiradaRequest;
import techbook.dto.DevolucaoRequest;
import techbook.model.Devolucao;
import techbook.model.Emprestimo;
import techbook.service.TechbookService;

import java.util.List;

@RestController
@RequestMapping("/api/emprestimos")
public class EmprestimoController {

    private final TechbookService service;

    public EmprestimoController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<Emprestimo> listar() {
        return service.listarEmprestimos();
    }

    @PostMapping("/confirmar-retirada")
    public Emprestimo confirmarRetirada(@Valid @RequestBody ConfirmarRetiradaRequest request) {
        return service.confirmarRetirada(request);
    }

    @PatchMapping("/{id}/renovar")
    public Emprestimo renovar(@PathVariable Long id) {
        return service.renovarEmprestimo(id);
    }

    @PostMapping("/devolucoes")
    public Devolucao devolver(@Valid @RequestBody DevolucaoRequest request) {
        return service.registrarDevolucao(request);
    }
}
