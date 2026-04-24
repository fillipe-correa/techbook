package com.techbook.service;

import com.techbook.model.Usuario;
import com.techbook.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Listar todos os usuários (ex: para uma tela de admin)
    public List<Usuario> buscarTodos() {
        return usuarioRepository.findAll();
    }

    // Criar um novo usuário (Cadastro)
    public Usuario cadastrar(Usuario usuario) {
        // Aqui você poderia adicionar uma lógica de criptografia de senha no futuro!
        return usuarioRepository.save(usuario);
    }

    // Buscar usuário por ID
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    // Deletar um usuário
    public void excluir(Long id) {
        usuarioRepository.deleteById(id);
    }
}