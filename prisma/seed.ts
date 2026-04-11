import { PrismaClient, Role } from '@/generated/prisma/client';
import bcrypt from 'bcrypt';


import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Début du seeding...');

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'tchuifon@gmail.com' },
  });

  if (existingAdmin) {
    console.log('✅ L\'administrateur existe déjà.');
    return;
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash('DR@@Tchuifon*', 10);

  // Créer l'utilisateur admin avec son profil complet
  const admin = await prisma.user.create({
    data: {
      email: 'tchuifon@gmail.com',
      password: hashedPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: 'TCHUIFON TCHUIFON Donald Raoul',
          title: 'Doctorat/Ph.D en Chimie - Physique',
          bio: `Enseignant-Chercheur au Département de Génie des Procédés de l'École Nationale Supérieure Polytechnique de Douala (ENSPD). Spécialisé en Chimie-Physique avec une expertise reconnue dans le domaine des procédés industriels et de la recherche appliquée.

Membre actif de la communauté académique camerounaise, contribuant à la formation de la prochaine génération d'ingénieurs et à l'avancement de la recherche scientifique au Cameroun.`,
          photoUrl: '/uploads/profiles/profile.jpeg',
          
          // Informations académiques
          specializations: ['Chimie-Physique', 'Génie des Procédés'],
          degrees: ['Doctorat/Ph.D en Chimie - Physique'],
          institution: 'École Nationale Supérieure Polytechnique de Douala (ENSPD)',
          department: 'Département de Génie des Procédés',
          
          // Coordonnées
          email: 'tchuifon@gmail.com',
          phone: '+237 674 78 00 94',
          officeLocation: 'PK 17 Douala Cameroun - Campus ENSPD',
          
          // Liens (à compléter si disponibles)
          website: 'https://www.ensp-udo.com',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Administrateur créé avec succès!');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nom complet:', admin.profile?.fullName);
  console.log('🎓 Titre:', admin.profile?.title);
  console.log('🏛️  Institution:', admin.profile?.institution);
  console.log('📞 Téléphone:', admin.profile?.phone);
  
  // Optionnel: Créer quelques exemples de publications
  console.log('\n📚 Création d\'exemples de publications...');
  
  await prisma.publication.create({
    data: {
      userId: admin.id,
      title: 'Advances in Chemical Process Engineering',
      slug: 'advances-in-chemical-process-engineering-2024',
      abstract: 'Research on innovative approaches in chemical process optimization and industrial applications.',
      authors: ['TCHUIFON Donald Ricoul'],
      publicationDate: new Date('2024-01-15'),
      year: 2024,
      journal: 'Journal of Chemical Engineering',
      volume: '12',
      issue: '3',
      pages: '145-162',
      type: 'ARTICLE',
      keywords: ['Chemical Engineering', 'Process Optimization', 'Industrial Applications'],
      pdfUrl: null,
      citations: 0,
    },
  });

  console.log('✅ Publications d\'exemple créées');
  
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