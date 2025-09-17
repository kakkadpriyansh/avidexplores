import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Linkedin, Instagram, Twitter, Facebook } from 'lucide-react';

async function getTeamMembers() {
  try {
    // Use INTERNAL_API_URL for server-side calls to avoid DNS issues
    const base = process.env.INTERNAL_API_URL || 'http://localhost:3000';
    const url = `${base}/api/teams`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [] as any[];
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (e) {
    console.error('Failed to load team members', e);
    return [] as any[];
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();

  // Group team members by type
  const founders = teamMembers.filter((member: any) => member.teamType === 'Founders');
  const coreTeam = teamMembers.filter((member: any) => member.teamType === 'Core Team' || !member.teamType);

  const renderTeamSection = (title: string, members: any[]) => {
    if (members.length === 0) return null;
    
    return (
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-foreground text-center mb-8">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member: any, index: number) => (
            <div key={member._id || index} className="card-glass p-6 flex flex-col">
              <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full bg-muted">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center">{member.name}</h3>
              <p className="text-sm text-muted-foreground text-center">{member.role}{member.experience ? ` • ${member.experience}` : ''}</p>
              {member.bio ? (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 text-center">{member.bio}</p>
              ) : null}

              {Array.isArray(member.specialties) && member.specialties.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {member.specialties.slice(0, 5).map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{s}</span>
                  ))}
                  {member.specialties.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{member.specialties.length - 5} more</span>
                  )}
                </div>
              )}

              {(member.socialMedia && (member.socialMedia.linkedin || member.socialMedia.instagram || member.socialMedia.twitter || member.socialMedia.facebook)) && (
                <div className="flex items-center justify-center gap-4 mt-5">
                  {member.socialMedia.linkedin && (
                    <Link href={member.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  )}
                  {member.socialMedia.instagram && (
                    <Link href={member.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Instagram className="h-5 w-5" />
                    </Link>
                  )}
                  {member.socialMedia.twitter && (
                    <Link href={member.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Twitter className="h-5 w-5" />
                    </Link>
                  )}
                  {member.socialMedia.facebook && (
                    <Link href={member.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Facebook className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-muted/40 to-background border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-foreground mb-6 leading-tight">
              Our Team
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Meet the passionate adventurers behind Avid Explorers. We are guides, coordinators, and storytellers dedicated to making your journeys unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {teamMembers.length === 0 ? (
            <div className="text-center text-muted-foreground py-16">No team members available yet.</div>
          ) : (
            <>
              {renderTeamSection('Founders', founders)}
              {renderTeamSection('Core Team', coreTeam)}
            </>
           )}
         </div>
       </section>

       <Footer />
     </div>
   );
 }