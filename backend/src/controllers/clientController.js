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


export const createClient = async (req, res) => {
    try {
        const clientData = req.body;
        const newClient = await clientService.createClient(clientData);
        res.status(200).json(newClient)
    } catch (err) {
        console.error('Error creating data:', err);
        res.status(500).json({ message: "Internal Server Error"});
    }
}


export const updateClient = async (req, res) => {
    // try {
        const clientId = req.params.id;
        const clientData = req.body;
        console.log("First Stop>>>", clientId," >>", clientData);
        const updateClient = await clientService.updateClient(clientId, clientData);
        console.log("Second Stop", updateClient)
        if (!updateClient) {
            return res.status(404).json({ message: "Client not found"});
        }
        res.status(200).json(updateClient)


    // } catch (err) {
    //     console.error('Error updating data:', err);
    //     res.status(500).json({ message: "Internal Server Error"});
    // }
}


export const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;
        const deleted = await clientService.deleteClient(clientId);
        if (!deleted) {
            return res.status(404).json({message: 'Client not found'});
        }
        res.status(200).send();
        } catch (err) {
            console.error('Error deleting clients', err);
            res.status(500).json({message: 'Internal Server Error'})
        }
    }



