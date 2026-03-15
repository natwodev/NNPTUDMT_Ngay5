var express = require("express");
var router = express.Router();

let roleController = require("../controllers/roles");

router.get("/", async function (req, res, next) {
    let roles = await roleController.GetAllRole();
    res.send(roles);
});

router.get("/:id", async function (req, res, next) {
    let result = await roleController.GetRoleById(req.params.id);
    if (result) {
        res.send(result);
    } else {
        res.status(404).send({ message: "id not found" });
    }
});

router.get("/:id/users", async function (req, res, next) {
    try {
        let users = await roleController.GetUsersByRoleId(req.params.id);
        res.send(users);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.post("/", async function (req, res, next) {
    try {
        let newItem = await roleController.CreateARole(
            req.body.name,
            req.body.description
        );
        res.send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.put("/:id", async function (req, res, next) {
    try {
        let updatedItem = await roleController.UpdateARole(req.params.id, req.body);
        if (!updatedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(updatedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.delete("/:id", async function (req, res, next) {
    try {
        let deletedItem = await roleController.DeleteARole(req.params.id);
        if (!deletedItem) {
            return res.status(404).send({ message: "id not found" });
        }
        res.send(deletedItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;
