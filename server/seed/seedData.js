import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import PlantingActivity from '../models/PlantingActivity.js';
import SurvivalInspection from '../models/SurvivalInspection.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting VanaTrack database seeding...');

    // Clear existing records
    await User.deleteMany({});
    await Project.deleteMany({});
    await PlantingActivity.deleteMany({});
    await SurvivalInspection.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('🧹 Purged existing collections.');

    // 1. Create Seed Users
    const adminUser = await User.create({
      name: 'Ananya Sharma',
      email: 'admin@vanatrack.org',
      password: 'Admin@123',
      role: 'admin',
      organization: 'Akshaya Vana Climate Ventures',
    });

    const managerUser = await User.create({
      name: 'Karthik Nair',
      email: 'manager@vanatrack.org',
      password: 'Manager@123',
      role: 'project_manager',
      organization: 'Akshaya Vana Field Operations',
    });

    const viewerUser = await User.create({
      name: 'Dr. Rohini Sen',
      email: 'viewer@vanatrack.org',
      password: 'Viewer@123',
      role: 'viewer',
      organization: 'Global Impact Carbon Registry',
    });

    console.log('👤 Created 3 core role users (Admin, Manager, Viewer).');

    // 2. Create Projects
    // Important Project matching the scenario:
    // Target 1000 trees. Initially verified: 600 trees (400 + 200).
    // Pending: 250 trees (Ready to test verification -> 850 total / 85% completion!).
    const project1 = await Project.create({
      projectId: 'PRJ-2026-001',
      name: 'Wayanad Western Ghats Reforestation',
      description: 'Restoration of degraded tropical agroforestry canopy in the vulnerable Western Ghats ecological zone.',
      category: 'Agroforestry',
      location: 'Wayanad, Kerala',
      latitude: 11.6854,
      longitude: 76.1320,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-12-31'),
      targetTrees: 1000,
      projectManager: managerUser._id,
      status: 'Active',
    });

    const project2 = await Project.create({
      projectId: 'PRJ-2026-002',
      name: 'Sundarbans Mangrove Tidal Shield',
      description: 'High-density Avicennia marina mangrove restoration along vulnerable delta coastlines.',
      category: 'Mangrove Restoration',
      location: 'South 24 Parganas, West Bengal',
      latitude: 21.9497,
      longitude: 89.1833,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-11-30'),
      targetTrees: 5000,
      projectManager: managerUser._id,
      status: 'Active',
    });

    const project3 = await Project.create({
      projectId: 'PRJ-2026-003',
      name: 'Bengaluru Urban Biodiversity Corridors',
      description: 'Native Miyawaki pocket forests to counter urban heat islands and replenish groundwater tables.',
      category: 'Urban Greenery',
      location: 'Bengaluru Urban, Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-31'),
      targetTrees: 2500,
      projectManager: managerUser._id,
      status: 'Active',
    });

    const project4 = await Project.create({
      projectId: 'PRJ-2026-004',
      name: 'Aravalli Ridge Afforestation & Soil Stabilization',
      description: 'Drought-resistant indigenous species plantation along the arid Aravalli mountain belt.',
      category: 'Afforestation',
      location: 'Alwar, Rajasthan',
      latitude: 27.5530,
      longitude: 76.6346,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      targetTrees: 8000,
      projectManager: managerUser._id,
      status: 'Active',
    });

    const project5 = await Project.create({
      projectId: 'PRJ-2026-005',
      name: 'Nilgiri Shola Forest Canopy Restoration',
      description: 'Preservation and planting of rare high-altitude endemic Shola trees and grassland buffers.',
      category: 'Biodiversity Corridor',
      location: 'Ooty, Tamil Nadu',
      latitude: 11.4102,
      longitude: 76.6950,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-03-01'),
      targetTrees: 3000,
      projectManager: managerUser._id,
      status: 'Active',
    });

    console.log('🌲 Created 5 environmental projects.');

    // 3. Planting Activities for Project 1 (Scenario: 600 verified, 250 pending, 50 rejected)
    const act1 = await PlantingActivity.create({
      projectId: project1._id,
      activityCode: 'ACT-WYD-001',
      plantationDate: new Date('2026-02-10'),
      treesPlanted: 400,
      location: 'Plot 4A, Meppadi Highlands, Wayanad',
      description: 'Planting of shade trees (Artocarpus hirsutus and Syzygium cumini) along coffee estates.',
      speciesList: ['Wild Jack', 'Malabar Plum', 'Rosewood'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2026-02-14'),
      verificationNotes: 'GPS coordinates and geotagged timestamp verified against drone flight log.',
    });

    const act2 = await PlantingActivity.create({
      projectId: project1._id,
      activityCode: 'ACT-WYD-002',
      plantationDate: new Date('2026-03-05'),
      treesPlanted: 200,
      location: 'Plot 7B, Chundale Ridge, Wayanad',
      description: 'Riparian buffer plantation along stream embankment to mitigate soil runoff.',
      speciesList: ['Bamboo', 'Terminalia arjuna', 'Ficus glomerata'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2026-03-09'),
      verificationNotes: 'Soil quality and sapling height standard certified by field supervisor.',
    });

    // PENDING ACTIVITY: 250 trees! (Key Test Scenario: When verified, count becomes 850 / 85% completion)
    const act3 = await PlantingActivity.create({
      projectId: project1._id,
      activityCode: 'ACT-WYD-003',
      plantationDate: new Date('2026-04-12'),
      treesPlanted: 250,
      location: 'Plot 9C, Vythiri Watershed, Wayanad',
      description: 'Phase III native canopy enrichment and fruit-bearing tree planting.',
      speciesList: ['Indian Gooseberry', 'Jackfruit', 'Neem'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Pending',
      verificationNotes: 'Pending field audit verification by climate auditor.',
    });

    const act4 = await PlantingActivity.create({
      projectId: project1._id,
      activityCode: 'ACT-WYD-004',
      plantationDate: new Date('2026-04-20'),
      treesPlanted: 50,
      location: 'Buffer Zone B, Kalpetta border',
      description: 'Boundary hedge saplings planted during heavy pre-monsoon shower.',
      speciesList: ['Acacia catechu'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Rejected',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2026-04-22'),
      verificationNotes: 'Evidence photo was blurry and sapling spacing violated agroforestry protocol.',
    });

    // Activities for Project 2 (Sundarbans)
    await PlantingActivity.create({
      projectId: project2._id,
      activityCode: 'ACT-SBN-001',
      plantationDate: new Date('2025-12-15'),
      treesPlanted: 3500,
      location: 'Canning Mudflats, Sundarbans',
      description: 'Dense mangrove propagules planted along intertidal mudflats.',
      speciesList: ['Avicennia marina', 'Rhizophora mucronata'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2025-12-20'),
      verificationNotes: 'Satellite and high-res drone NDVI verified.',
    });

    await PlantingActivity.create({
      projectId: project2._id,
      activityCode: 'ACT-SBN-002',
      plantationDate: new Date('2026-03-18'),
      treesPlanted: 500,
      location: 'Gosaba Island Shoreline',
      description: 'Community-led mangrove nursery transplantation.',
      speciesList: ['Ceriops decandra'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Pending',
    });

    // Activities for Project 3 (Bengaluru Urban Corridors)
    await PlantingActivity.create({
      projectId: project3._id,
      activityCode: 'ACT-BLR-001',
      plantationDate: new Date('2026-02-25'),
      treesPlanted: 1200,
      location: 'Bellandur Lake Buffer Belt',
      description: 'Miyawaki urban forest cluster planted with civic volunteers.',
      speciesList: ['Peepal', 'Neem', 'Pongamia', 'Jamun'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2026-03-01'),
      verificationNotes: 'Civic geotag verified with biometric volunteer registry.',
    });

    // Activities for Project 4 (Aravalli)
    await PlantingActivity.create({
      projectId: project4._id,
      activityCode: 'ACT-ARV-001',
      plantationDate: new Date('2025-10-10'),
      treesPlanted: 4800,
      location: 'Sariska Buffer Corridor, Alwar',
      description: 'Indigenous drought-resilient trees with water-saving hydrogel root dip.',
      speciesList: ['Khejri', 'Dhaw', 'Desi Babool'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2025-10-18'),
      verificationNotes: 'Remote sensing ground truth match confirmed.',
    });

    // Activities for Project 5 (Nilgiris)
    await PlantingActivity.create({
      projectId: project5._id,
      activityCode: 'ACT-NLG-001',
      plantationDate: new Date('2026-03-15'),
      treesPlanted: 1500,
      location: 'Upper Bhavani Shola Reserve',
      description: 'Shola sapling propagation with indigenous Toda community forest stewards.',
      speciesList: ['Rhododendron nilagiricum', 'Michelia nilagirica'],
      evidencePhotoUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      submittedBy: managerUser._id,
      verificationStatus: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2026-03-20'),
      verificationNotes: 'Botanical audit completed.',
    });

    console.log('🌱 Created 9 planting activities across projects.');

    // 4. Survival Inspections (Key Differentiating Feature!)
    // Project 1 (Wayanad): 30-day and 90-day inspections
    await SurvivalInspection.create({
      projectId: project1._id,
      activityId: act1._id,
      inspectionType: '30-Day',
      inspectionDate: new Date('2026-03-12'),
      treesInspected: 200,
      treesSurviving: 184,
      treesDead: 16,
      survivalRate: 92.0,
      notes: 'Excellent initial sapling vitality. Adequate rainfall and mulch cover noted.',
      healthCondition: 'Excellent',
      recordedBy: managerUser._id,
    });

    await SurvivalInspection.create({
      projectId: project1._id,
      activityId: act1._id,
      inspectionType: '90-Day',
      inspectionDate: new Date('2026-05-10'),
      treesInspected: 200,
      treesSurviving: 176,
      treesDead: 24,
      survivalRate: 88.0,
      notes: 'Minor termite presence noticed on 8 saplings; bio-neem pesticide treatment applied.',
      healthCondition: 'Good',
      recordedBy: managerUser._id,
    });

    // Project 2 (Sundarbans): 90-Day inspection
    await SurvivalInspection.create({
      projectId: project2._id,
      inspectionType: '90-Day',
      inspectionDate: new Date('2026-03-20'),
      treesInspected: 500,
      treesSurviving: 470,
      treesDead: 30,
      survivalRate: 94.0,
      notes: 'Strong root anchoring against tidal ebb. Salinity tolerance tests passed.',
      healthCondition: 'Excellent',
      recordedBy: managerUser._id,
    });

    // Project 3 (Bengaluru): 30-Day inspection (Low Survival Rate: 64% -> triggers Alert!)
    await SurvivalInspection.create({
      projectId: project3._id,
      inspectionType: '30-Day',
      inspectionDate: new Date('2026-03-28'),
      treesInspected: 300,
      treesSurviving: 192,
      treesDead: 108,
      survivalRate: 64.0,
      notes: 'Severe water deficit during peak heatwave week. Drip irrigation repair requested.',
      healthCondition: 'Critical',
      recordedBy: managerUser._id,
    });

    // Project 4 (Aravalli): 180-Day inspection
    await SurvivalInspection.create({
      projectId: project4._id,
      inspectionType: '180-Day',
      inspectionDate: new Date('2026-04-10'),
      treesInspected: 600,
      treesSurviving: 516,
      treesDead: 84,
      survivalRate: 86.0,
      notes: 'Drought-tolerant varieties established deep taproots successfully.',
      healthCondition: 'Good',
      recordedBy: managerUser._id,
    });

    console.log('🩺 Created 5 survival monitoring audit logs.');

    // 5. Initial Audit Logs
    await AuditLog.create([
      {
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'PROJECT_CREATED',
        entityType: 'Project',
        entityId: String(project1._id),
        recordTitle: project1.name,
        newValue: { name: project1.name, targetTrees: 1000, category: project1.category },
        reason: 'Project baseline initialized for Akshaya Vana 2026 Reforestation Portfolio.',
        timestamp: new Date('2026-01-15T09:00:00Z'),
      },
      {
        userId: managerUser._id,
        userEmail: managerUser.email,
        userRole: managerUser.role,
        action: 'ACTIVITY_SUBMITTED',
        entityType: 'PlantingActivity',
        entityId: String(act1._id),
        recordTitle: 'ACT-WYD-001 (400 trees)',
        newValue: { treesPlanted: 400, location: act1.location },
        reason: 'Field planting completed and evidence uploaded by Field Lead.',
        timestamp: new Date('2026-02-10T14:30:00Z'),
      },
      {
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'ACTIVITY_VERIFIED',
        entityType: 'PlantingActivity',
        entityId: String(act1._id),
        recordTitle: 'ACT-WYD-001 (400 trees)',
        previousValue: { verificationStatus: 'Pending' },
        newValue: { verificationStatus: 'Verified' },
        reason: 'Photographic evidence and drone orthomosaic verified.',
        timestamp: new Date('2026-02-14T11:15:00Z'),
      },
      {
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'ACTIVITY_VERIFIED',
        entityType: 'PlantingActivity',
        entityId: String(act2._id),
        recordTitle: 'ACT-WYD-002 (200 trees)',
        previousValue: { verificationStatus: 'Pending' },
        newValue: { verificationStatus: 'Verified' },
        reason: 'Sapling health protocol met.',
        timestamp: new Date('2026-03-09T16:00:00Z'),
      },
      {
        userId: managerUser._id,
        userEmail: managerUser.email,
        userRole: managerUser.role,
        action: 'ACTIVITY_SUBMITTED',
        entityType: 'PlantingActivity',
        entityId: String(act3._id),
        recordTitle: 'ACT-WYD-003 (250 trees)',
        newValue: { treesPlanted: 250, location: act3.location },
        reason: 'Field planting submission awaiting auditor verification.',
        timestamp: new Date('2026-04-12T10:00:00Z'),
      },
    ]);

    console.log('📜 Initialized immutable audit trail.');
    console.log('✅ Database seeding finished successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Allow running directly from CLI: node seed/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
