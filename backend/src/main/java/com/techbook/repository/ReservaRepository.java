package com.techbook.repository;

import com.techbook.model.Reserva;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByClienteIdOrderByIdDesc(Long clienteId);

    List<Reserva> findByStatusAndPrazoRetiradaBefore(String status, LocalDate data);
}
