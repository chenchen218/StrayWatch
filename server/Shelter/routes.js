import express from 'express';
import { client } from '../db/connector.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Create new shelter
router.post('/', async (req, res) => {
  try {
    const db = client.db("appDB");
    const sheltersCollection = db.collection("shelters");
    
    // Validate required fields
    if (!req.body.shelterName || !req.body.shelterAddress) {
      return res.status(400).json({ message: 'Name and address are required' });
    }

    const newShelter = {
      name: req.body.shelterName,
      address: req.body.shelterAddress,
      phone: req.body.shelterPhone || null,
      email: req.body.shelterEmail || null,
      website: req.body.shelterWebsite || null,
      location: req.body.location ? {
        type: "Point",
        coordinates: req.body.location.coordinates
      } : null,
      pets: [],
      userId: req.body.userId || null,
      verified: false
    };

    const result = await sheltersCollection.insertOne(newShelter);
    
    if (!result.acknowledged) {
      return res.status(400).json({ message: 'Failed to register shelter' });
    }

    res.status(201).json({ 
      message: 'Shelter registered successfully',
      shelter: { ...newShelter, _id: result.insertedId }
    });
  } catch (err) {
    console.error("Error registering shelter:", err);
    res.status(500).json({ message: "Error registering shelter" });
  }
});

// Get all shelters
router.get('/', async (req, res) => {
  try {
    const db = client.db("appDB");
    const sheltersCollection = db.collection("shelters");
    
    const shelters = await sheltersCollection.find({}).toArray();
    
    res.status(200).json(shelters);
  } catch (err) {
    console.error("Error fetching shelters:", err);
    res.status(500).json({ message: "Error fetching shelters" });
  }
});

// Add this after your existing routes
router.patch('/:id/toggle-verification', async (req, res) => {
  try {
    const db = client.db("appDB");
    const sheltersCollection = db.collection("shelters");
    
    const shelter = await sheltersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    const result = await sheltersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { verified: !shelter.verified } }
    );

    if (!result.acknowledged) {
      return res.status(400).json({ message: 'Failed to update shelter' });
    }

    res.status(200).json({ 
      message: 'Shelter verification status updated',
      verified: !shelter.verified
    });
  } catch (err) {
    console.error("Error updating shelter verification:", err);
    res.status(500).json({ message: "Error updating shelter verification" });
  }
});

// Delete shelter by ID
router.delete('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid shelter ID format' });
    }

    const db = client.db("appDB");
    const sheltersCollection = db.collection("shelters");
    const petsCollection = db.collection("pets");
    
    const shelterId = new ObjectId(req.params.id);

    // First, delete all pets associated with this shelter
    await petsCollection.deleteMany({ shelterId: shelterId });

    // Then delete the shelter
    const result = await sheltersCollection.deleteOne({ _id: shelterId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.status(200).json({ 
      message: 'Shelter and associated pets deleted successfully'
    });
  } catch (err) {
    console.error("Error deleting shelter:", err);
    res.status(500).json({ message: "Error deleting shelter" });
  }
});

export default router;