import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Clock, Award, Heart, Sparkles } from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Clock,
      title: "Horneado Diario",
      description: "Productos frescos elaborados cada mañana",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      icon: Award,
      title: "Calidad Premium",
      description: "Ingredientes seleccionados de la mejor calidad",
      gradient: "from-yellow-500/10 to-amber-500/10",
    },
    {
      icon: Heart,
      title: "Hecho con Amor",
      description: "Recetas tradicionales con pasión artesanal",
      gradient: "from-rose-500/10 to-pink-500/10",
    },
  ]

  const categories = [
    {
      name: "Panes",
      image: "/artisan-bread.png",
      href: "/catalogo?category=panes",
      description: "Artesanales y crujientes",
    },
    {
      name: "Pasteles",
      image: "/cakes.jpg",
      href: "/catalogo?category=pasteles",
      description: "Deliciosos y esponjosos",
    },
    {
      name: "Galletas",
      image: "/assorted-cookies.png",
      href: "/catalogo?category=galletas",
      description: "Perfectas para compartir",
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20" />
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <Image
          src="/cozy-bakery.png"
          alt="Panadería Delicia"
          fill
          className="object-cover opacity-10 dark:opacity-5"
          priority
        />
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Horneado fresco cada día</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-balance bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 dark:from-amber-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent animate-fade-in-up">
              Bienvenido a Delicia
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-pretty leading-relaxed animate-fade-in-up delay-200">
              El sabor artesanal de siempre, horneado con amor cada día. Descubre la tradición en cada bocado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
              <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto group">
                <Link href="/catalogo" className="flex items-center justify-center">
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 w-full sm:w-auto transition-all hover:scale-105">
                <Link href="/registro" className="flex items-center justify-center">Crear Cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-amber-600/50 rounded-full p-1">
            <div className="w-1.5 h-3 bg-amber-600 rounded-full mx-auto animate-scroll" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white dark:bg-background relative">
        <div className="max-w-7xl w-full mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La excelencia en cada detalle
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br ${feature.gradient} backdrop-blur group`}
              >
                <CardContent className="pt-8 pb-8 px-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/10">
        <div className="max-w-7xl w-full mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
              Explora Nuestras Categorías
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestra amplia variedad de productos artesanales
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                href={category.href}
                className="group block"
              >
                <Card className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 hover:border-amber-300 dark:hover:border-amber-700 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all" />
                    {/* Overlay Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <p className="text-amber-200 text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {category.description}
                        </p>
                      </div>
                      {/* Arrow Icon */}
                      <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="max-w-7xl w-full mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance">
            ¿Listo para disfrutar?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-95 leading-relaxed">
            Crea tu cuenta y comienza a disfrutar de nuestros productos artesanales. 
            ¡Tu próximo antojo está a un clic de distancia!
          </p>
          <Button 
            asChild 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 group"
          >
            <Link href="/registro" className="flex items-center justify-center">
              Registrarse Ahora
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}