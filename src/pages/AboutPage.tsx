import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SEO } from '@/components/SEO';

gsap.registerPlugin(ScrollTrigger);

export const AboutPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const visionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Hero animation
      if (heroRef.current) {
        const title = heroRef.current.querySelector('.hero-title');
        const subtitle = heroRef.current.querySelector('.hero-subtitle');
        const description = heroRef.current.querySelector('.hero-description');
        
        // Set initial state
        if (title) gsap.set(title, { opacity: 0, y: 50 });
        if (subtitle) gsap.set(subtitle, { opacity: 0, y: 30 });
        if (description) gsap.set(description, { opacity: 0, y: 20 });
        
        if (title && subtitle && description) {
          const heroTimeline = gsap.timeline();
          
          heroTimeline
            .to(title, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
            })
            .to(
              subtitle,
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
              },
              '-=0.5'
            )
            .to(
              description,
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
              },
              '-=0.4'
            );
        }
      }

      // Stats animation
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.stat-item');
        if (statItems.length > 0) {
          gsap.set(statItems, { opacity: 0, y: 50, scale: 0.9 });
          
          const statsTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          });

          statsTimeline.to(statItems, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          });
        }
      }

      // Mission animation
      if (missionRef.current) {
        gsap.set(missionRef.current, { opacity: 0, x: -80 });
        
        gsap.to(missionRef.current, {
          scrollTrigger: {
            trigger: missionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
        });
      }

      // Vision animation
      if (visionRef.current) {
        gsap.set(visionRef.current, { opacity: 0, x: 80 });
        
        gsap.to(visionRef.current, {
          scrollTrigger: {
            trigger: visionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
        });
      }

      // Values animation
      if (valuesRef.current) {
        const valueItems = valuesRef.current.querySelectorAll('.value-item');
        if (valueItems.length > 0) {
          gsap.set(valueItems, { opacity: 0, scale: 0.8, y: 30 });
          
          const valuesTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: valuesRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          });

          valuesTimeline.to(valueItems, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'back.out(1.4)',
          });
        }
      }

      // Team animation
      if (teamRef.current) {
        const teamItems = teamRef.current.querySelectorAll('.team-item');
        if (teamItems.length > 0) {
          gsap.set(teamItems, { opacity: 0, y: 40 });
          
          const teamTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: teamRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
          });

          teamTimeline.to(teamItems, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
          });
        }
      }

      // Refresh ScrollTrigger after all animations are set up
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <SEO 
        title="Hakkımızda - WeCamp | Misyonumuz, Vizyonumuz ve Değerlerimiz" 
        description="WeCamp hakkında bilgiler. Doğada unutulmaz kamp deneyimleri için güvenilir kamp partneriniz. Türkiye'nin en kapsamlı kamp pazar yeri. Misyonumuz, vizyonumuz ve değerlerimizi keşfedin."
        keywords="WeCamp hakkında, kamp pazar yeri, kamp malzemeleri, kamp alanları, doğa aktiviteleri, kamp rehberi, kamp platformu Türkiye, kamp şirketi, outdoor platform"
      />

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative h-[500px] md:h-[600px] flex items-center justify-center text-center text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600" />
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&h=1080&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg">
              WeCamp Hakkında
            </h1>
            <p className="hero-subtitle text-xl sm:text-2xl md:text-3xl mb-6 text-gray-100 font-medium drop-shadow-md">
              Doğada Unutulmaz Kamp Deneyimleri İçin
            </p>
            <p className="hero-description text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              Sizlerle birlikte büyüyen, güvenilir kamp partneriniz. 
              Her kamp deneyiminin özel olduğuna inanıyoruz.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section
          ref={statsRef}
          className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 -mt-1"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {[
                { value: '200+', label: 'Kamp Alanı', icon: '🏕️' },
                { value: '500+', label: 'Kiralık Malzeme', icon: '🎒' },
                { value: '5000+', label: 'Mutlu Müşteri', icon: '😊' },
                { value: '50+', label: 'Farklı Bölge', icon: '📍' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-item text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="text-4xl sm:text-5xl mb-3">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section
          ref={missionRef}
          className="py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-800"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 md:p-16 border border-primary-200 dark:border-primary-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-0 sm:mr-6">🎯</div>
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                    Misyonumuz
                  </h2>
                  <div className="w-20 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  Doğaya saygılı, sürdürülebilir ve güvenli kamp deneyimleri sunarak, 
                  insanların doğayla anlamlı bağlantılar kurmasına yardımcı olmak.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  Her kamp deneyiminin özel ve benzersiz olduğuna inanıyoruz. 
                  Müşterilerimize en kaliteli kamp alanları ve ekipmanları sunmak, 
                  kamp kültürünü yaygınlaştırmak ve herkesin doğayla buluşmasını sağlamak için 
                  sürekli gelişiyor ve çalışıyoruz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section
          ref={visionRef}
          className="py-16 sm:py-20 md:py-24 bg-gray-50 dark:bg-gray-900"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 md:p-16 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-8">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-0 sm:mr-6">✨</div>
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                    Vizyonumuz
                  </h2>
                  <div className="w-20 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  Türkiye'nin en güvenilir, kapsamlı ve kullanıcı dostu kamp alanı 
                  ve malzeme platformu olmak.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  Doğa severlerin birinci tercihi olarak, kamp kültürünü yaygınlaştırmak, 
                  sürdürülebilir turizme katkıda bulunmak ve herkesin doğayla 
                  güvenli bir şekilde buluşmasını sağlamak. Teknolojinin gücünü kullanarak 
                  kamp deneyimini kolaylaştırmak ve unutulmaz anılar yaratmak.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section
          ref={valuesRef}
          className="py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Değerlerimiz
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                İşimizi yönlendiren temel değerlerimiz
              </p>
              <div className="w-24 h-1 bg-primary-600 dark:bg-primary-400 rounded-full mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: '🌿',
                  title: 'Doğaya Saygı',
                  description: 'Sürdürülebilir ve çevre dostu kamp deneyimleri sunuyor, doğayı korumaya özen gösteriyoruz.',
                },
                {
                  icon: '❤️',
                  title: 'Müşteri Memnuniyeti',
                  description: 'Her müşterimizin memnuniyeti bizim için en önemli önceliktir. Mutlu müşteriler, mutlu bizler.',
                },
                {
                  icon: '🛡️',
                  title: 'Güvenlik',
                  description: 'Güvenli ve güvenilir hizmet sunmak için sürekli çalışıyor, standartlarımızı yükseltiyoruz.',
                },
                {
                  icon: '⭐',
                  title: 'Kalite',
                  description: 'En kaliteli ekipmanları ve hizmetleri sunmaya odaklanıyor, kaliteden asla ödün vermiyoruz.',
                },
              ].map((value, index) => (
                <motion.div
                  key={index}
                  className="value-item bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  whileHover={{ y: -8, scale: 1.03 }}
                >
                  <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">{value.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section 
          ref={teamRef}
          className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Ekibimiz
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Sizler için çalışan deneyimli ekibimiz
              </p>
              <div className="w-24 h-1 bg-primary-600 dark:bg-primary-400 rounded-full mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  name: 'Ahmet Yılmaz', 
                  role: 'Kurucu & CEO', 
                  emoji: '👨‍💼',
                  description: 'Kamp tutkunu ve doğa sever. 15 yıllık deneyim ile WeCamp\'i hayata geçirdi.'
                },
                { 
                  name: 'Ayşe Demir', 
                  role: 'Operasyon Müdürü', 
                  emoji: '👩‍💼',
                  description: 'Müşteri memnuniyeti ve operasyonel mükemmellik konularında uzman.'
                },
                { 
                  name: 'Mehmet Kaya', 
                  role: 'Teknik Direktör', 
                  emoji: '👨‍💻',
                  description: 'Teknoloji ve inovasyon alanında ekibimize öncülük ediyor.'
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  className="team-item text-center p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  whileHover={{ y: -5 }}
                >
                  <div className="text-6xl sm:text-7xl mb-4 sm:mb-6">{member.emoji}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold mb-3 sm:mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-r from-primary-700 to-primary-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Kamp Maceranıza Başlayın
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-gray-100">
              Doğada unutulmaz anılar biriktirmek için bugün bize katılın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/gear"
                className="px-8 py-4 bg-white text-primary-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Malzemeleri Keşfet
              </motion.a>
              <motion.a
                href="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Bize Ulaşın
              </motion.a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
