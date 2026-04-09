package techbook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import techbook.dto.ClienteRequest;
import techbook.model.Cliente;
import techbook.model.Emprestimo;
import techbook.model.Reserva;
import techbook.service.TechbookService;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final TechbookService service;

    public ClienteController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cliente> listar() {
        return service.listarClientes();
    }

    @PostMapping
    public Cliente cadastrar(@Valid @RequestBody ClienteRequest request) {
        return service.cadastrarCliente(request);
    }

    @GetMapping("/{id}/reservas")
    public List<Reserva> reservas(@PathVariable Long id) {
        return service.listarReservasDoCliente(id);
    }

    @GetMapping("/{id}/emprestimos")
    public List<Emprestimo> emprestimos(@PathVariable Long id) {
        return service.listarEmprestimosDoCliente(id);
    }
}
