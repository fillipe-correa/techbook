package com.techbook.controller;

import com.techbook.model.Usuario;
import com.techbook.service.UsuarioService; // Importa o Service agora
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService; // Chama o Service em vez do Repository

    @GetMapping
    public List<Usuario> listar() {
        return usuarioService.buscarTodos();
    }

    @PostMapping
    public Usuario criar(@RequestBody Usuario usuario) {
        return usuarioService.cadastrar(usuario);
    }
}