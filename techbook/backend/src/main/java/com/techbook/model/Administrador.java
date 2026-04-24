package com.techbook.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Administrador extends Usuario {
    private String login;
    private String senha;
}