package com.techbook.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Cliente extends Usuario {
    private String cpf;

}