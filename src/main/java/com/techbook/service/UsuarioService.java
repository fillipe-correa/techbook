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

    // Listar todos os usuários
    public List<Usuario> buscarTodos() {
        return usuarioRepository.findAll();
    }

    // Salvar um novo usuário
    public Usuario cadastrar(Usuario usuario) {
        // Aqui você poderia colocar regras, como "verificar se o email já existe"
        return usuarioRepository.save(usuario);
    }

    // Buscar por ID
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    // Deletar
    public void excluir(Long id) {
        usuarioRepository.deleteById(id);
    }
}