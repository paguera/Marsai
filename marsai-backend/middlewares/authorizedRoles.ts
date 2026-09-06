

// Middleware to authorize based on user roles
const authorizedRoles = (allowedRoles: string[]) => (req: any, res: any, next: Function): any => {

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send("Accès interdit");
    }
    next();
};
export default authorizedRoles;