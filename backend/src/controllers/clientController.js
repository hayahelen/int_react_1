import * as clientService from "../services/clientServices.js"

export const getClients = async (req, res) => {
    try {
        const clients = await clientService.getClients();
        res.status(200).json(clients);
    } catch (err) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: "Internal Server Error"});
    }
}