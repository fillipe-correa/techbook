package techbook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import techbook.model.Reserva;
import techbook.model.ReservaStatus;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByClienteIdOrderByDataReservaDesc(Long clienteId);
    long countByStatus(ReservaStatus status);
    List<Reserva> findByStatusAndPrazoRetiradaBefore(ReservaStatus status, LocalDate data);
}
