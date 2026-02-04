// Recebe um array de níveis permitidos
export const roleMiddleware = (rolesPermitidos) => {
    return (req, res, next) => {
        const usuario = req.usuario;

        if (!usuario || !rolesPermitidos.includes(usuario.role)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        next();
    };
};
