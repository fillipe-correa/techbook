package com.techbook.config;

import com.techbook.model.Emprestimo;
import com.techbook.model.Livro;
import com.techbook.model.Reserva;
import com.techbook.model.Usuario;
import com.techbook.repository.EmprestimoRepository;
import com.techbook.repository.LivroRepository;
import com.techbook.repository.ReservaRepository;
import com.techbook.repository.UsuarioRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
        LivroRepository livroRepository,
        UsuarioRepository usuarioRepository,
        ReservaRepository reservaRepository,
        EmprestimoRepository emprestimoRepository
    ) {
        return args -> {
            if (livroRepository.count() > 0 || usuarioRepository.count() > 0) {
                return;
            }

            Livro cleanCode = new Livro();
            cleanCode.setTitulo("Clean Code");
            cleanCode.setAutor("Robert C. Martin");
            cleanCode.setCategoria("Engenharia de Software");
            cleanCode.setDescricao("Boas praticas de desenvolvimento, legibilidade e manutencao de codigo.");
            cleanCode.setImagemUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80");
            cleanCode.setIsbn("9780132350884");
            cleanCode.setQuantidadeTotal(4);
            cleanCode.setQuantidadeDisponivel(3);

            Livro springBoot = new Livro();
            springBoot.setTitulo("Spring Boot na Pratica");
            springBoot.setAutor("TechBook Editorial");
            springBoot.setCategoria("Backend");
            springBoot.setDescricao("Guia introdutorio para APIs REST com Spring Boot e JPA.");
            springBoot.setImagemUrl("https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80");
            springBoot.setIsbn("9786500000001");
            springBoot.setQuantidadeTotal(5);
            springBoot.setQuantidadeDisponivel(5);

            Livro ux = new Livro();
            ux.setTitulo("Interfaces que Conversam");
            ux.setAutor("Ana Martins");
            ux.setCategoria("Frontend");
            ux.setDescricao("Conceitos de experiencia do usuario, integracao de telas e estados de interface.");
            ux.setImagemUrl("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80");
            ux.setIsbn("9786500000002");
            ux.setQuantidadeTotal(2);
            ux.setQuantidadeDisponivel(1);

            cleanCode = livroRepository.save(cleanCode);
            springBoot = livroRepository.save(springBoot);
            ux = livroRepository.save(ux);

            Usuario usuario = new Usuario();
            usuario.setNome("Edino");
            usuario.setEmail("edino@techbook.local");
            usuario.setTelefone("(11) 99999-6969");
            usuario.setCpf("11122233344");
            usuario = usuarioRepository.save(usuario);

            Reserva reserva = new Reserva();
            reserva.setCliente(usuario);
            reserva.setLivro(cleanCode);
            reserva.setDataReserva(LocalDate.now().minusDays(1));
            reserva.setPrazoRetirada(LocalDate.now().plusDays(2));
            reserva.setStatus("PENDENTE");
            reserva = reservaRepository.save(reserva);

            Emprestimo emprestimo = new Emprestimo();
            emprestimo.setCliente(usuario);
            emprestimo.setLivro(ux);
            emprestimo.setReserva(null);
            emprestimo.setAdministradorId(1L);
            emprestimo.setDataEmprestimo(LocalDate.now().minusDays(16));
            emprestimo.setDataDevolucaoPrevista(LocalDate.now().minusDays(2));
            emprestimo.setStatus("ATRASADO");
            emprestimo.setRenovado(false);
            emprestimoRepository.save(emprestimo);
        };
    }
}
