package techbook.dto;

public record DashboardResponse(
        long totalLivros,
        long emprestimosAtivos,
        long atrasados,
        long usuarios,
        long reservasPendentes,
        long livrosDisponiveis,
        long livrosIndisponiveis
) {
}
