import { PrismaClient, Role, PublicationType } from '@/generated/prisma/client';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Données du profil admin (centralisées pour faciliter les modifications)
const ADMIN_PROFILE_DATA = {
  fullName: 'Pr. TCHUIFON TCHUIFON Donald Raoul',
  title: 'Maître de Conférences — Chimie Inorganique / Chimie Physique',
  bio: `Enseignant-Chercheur au Département de Génie des Procédés de l'École Nationale Supérieure Polytechnique de Douala (ENSPD). Spécialisé en Chimie industrielle avec une expertise reconnue dans le domaine des bioénergies, du traitement des eaux usées, synthèse et caractérisation des matériaux.

Membre actif de la communauté académique camerounaise, contribuant à la formation de la prochaine génération d'ingénieurs et à l'avancement de la recherche scientifique au Cameroun.`,
  specializations: [
    'Traitement des eaux usées',
    'Bioénergie',
    'Procédés d\'Oxydation Avancée',
    'Synthèse et caractérisation des matériaux',
    'Analyse thermique (Pyrolyse)',
  ],
  degrees: [
    'Licence en Chimie Inorganique (2010)',
    'Master 2 Recherche en Chimie Inorganique — Chimie Physique et Théorique (2013)',
    'Doctorat/PhD en Chimie Inorganique — Chimie Physique et Théorique (2016)',
    'Assistant au Département Génie des Procédés, ENSPD (2020)',
    'Chargé de Cours, ENSPD (2021)',
    'Maître de Conférences, ENSPD (2025)',
  ],
  institution: 'École Nationale Supérieure Polytechnique de Douala (ENSPD)',
  department: 'Département de Génie des Procédés',
  email: 'tchuifondonald@yahoo.fr',
  phone: '+237 674 78 00 94',
  officeLocation: 'PK 17 Douala Cameroun — Campus ENSPD',
  website: 'https://www.ensp-udo.com',
};

// Données des publications d'exemple
const EXAMPLE_PUBLICATIONS = [
  {
    title: 'Advances in Chemical Process Engineering',
    slug: 'advances-in-chemical-process-engineering-2024',
    abstract: 'Research on innovative approaches in chemical process optimization and industrial applications.',
    authors: ['TCHUIFON Donald Raoul'],
    publicationDate: new Date('2024-01-15'),
    year: 2024,
    journal: 'Journal of Chemical Engineering',
    volume: '12',
    issue: '3',
    pages: '145-162',
    type: PublicationType.ARTICLE, // ✅ Utilisation de l'enum
    keywords: ['Chemical Engineering', 'Process Optimization', 'Industrial Applications'],
  },
  {
    title: 'Traitement des eaux usées par procédés d\'oxydation avancée',
    slug: 'traitement-eaux-usees-oxydation-avancee-2024',
    abstract: 'Étude comparative des procédés d\'oxydation avancée pour le traitement des effluents industriels au Cameroun.',
    authors: ['TCHUIFON Donald Raoul', 'Collaborateur'],
    publicationDate: new Date('2024-06-20'),
    year: 2024,
    journal: 'Revue Camerounaise de Chimie',
    volume: '8',
    issue: '2',
    pages: '89-104',
    type: PublicationType.ARTICLE, // ✅ Utilisation de l'enum
    keywords: ['Traitement des eaux', 'Oxydation avancée', 'Effluents industriels'],
  },
];

async function main() {
  console.log('🌱 Début du seeding...');

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'tchuifon@gmail.com' },
    include: { profile: true },
  });

  const hashedPassword = await bcrypt.hash('DR@@Tchuifon*', 10);

  let admin;

  if (existingAdmin) {
    console.log('📝 Administrateur existant trouvé. Mise à jour du profil...');

    // Mettre à jour l'utilisateur et son profil
    admin = await prisma.user.update({
      where: { email: 'tchuifon@gmail.com' },
      data: {
        // Met à jour le mot de passe (au cas où)
        password: hashedPassword,
        role: Role.ADMIN,
        // Met à jour ou crée le profil
        profile: {
          upsert: {
            create: ADMIN_PROFILE_DATA,
            update: ADMIN_PROFILE_DATA,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log('✅ Profil administrateur mis à jour avec succès!');
  } else {
    console.log('🆕 Aucun administrateur trouvé. Création...');

    // Créer l'utilisateur admin avec son profil complet
    admin = await prisma.user.create({
      data: {
        email: 'tchuifon@gmail.com',
        password: hashedPassword,
        role: Role.ADMIN,
        profile: {
          create: ADMIN_PROFILE_DATA,
        },
      },
      include: {
        profile: true,
      },
    });

    console.log('✅ Administrateur créé avec succès!');
  }

  console.log('\n📋 Informations administrateur:');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nom complet:', admin.profile?.fullName);
  console.log('🎓 Titre:', admin.profile?.title);
  console.log('🏛️  Institution:', admin.profile?.institution);
  console.log('📞 Téléphone:', admin.profile?.phone);

  // Optionnel: Créer ou mettre à jour les publications d'exemple
  console.log('\n📚 Gestion des publications d\'exemple...');

  for (const pubData of EXAMPLE_PUBLICATIONS) {
    const existingPub = await prisma.publication.findUnique({
      where: { slug: pubData.slug },
    });

    if (!existingPub) {
      await prisma.publication.create({
        data: {
          ...pubData,
          userId: admin.id,
          pdfUrl: null,
          citations: 0,
        },
      });
      console.log(`✅ Publication créée: "${pubData.title}"`);
    } else {
      console.log(`⏩ Publication existe déjà: "${pubData.title}"`);
    }
  }

  // Afficher un résumé
  const publicationCount = await prisma.publication.count({
    where: { userId: admin.id },
  });

  console.log('\n📊 Résumé du seeding:');
  console.log(`👤 Administrateur: ${admin.profile?.fullName || admin.email}`);
  console.log(`📚 Total publications: ${publicationCount}`);
  console.log('\n🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });