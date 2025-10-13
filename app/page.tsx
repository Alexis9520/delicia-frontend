"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Clock, Award, Heart, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const features = [
    {
      icon: Clock,
      title: "Horneado Diario",
      description: "Productos frescos elaborados cada mañana, listos para ti.",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      icon: Award,
      title: "Calidad Premium",
      description: "Ingredientes seleccionados, técnicas artesanales y sabor excepcional.",
      gradient: "from-yellow-500/10 to-amber-500/10",
    },
    {
      icon: Heart,
      title: "Hecho con Amor",
      description: "Tradición familiar y pasión en cada receta.",
      gradient: "from-rose-500/10 to-pink-500/10",
    },
  ]

  const categories = [
    {
      name: "Panes",
      image: "/artisan-bread.png",
      href: "/catalogo?category=panes",
      description: "Artesanales y crujientes. ¡Descubre variedades únicas!",
    },
    {
      name: "Pasteles",
      image: "/cakes.jpg",
      href: "/catalogo?category=pasteles",
      description: "Deliciosos y esponjosos. Para todo tipo de celebraciones.",
    },
    {
      name: "Galletas",
      image: "/assorted-cookies.png",
      href: "/catalogo?category=galletas",
      description: "Perfectas para compartir. Sabor y crocancia inigualables.",
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] select-none items-center justify-center overflow-hidden">
        {/* Fondo cálido */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-rose-50 to-amber-100 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950" />
        {/* Blobs decorativos sutiles */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-400/10" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-400/10" />
        {/* Textura suave */}
        <Image
          src="/cozy-bakery.png"
          alt="Panadería Delicia"
          fill
          className="object-cover opacity-10 dark:opacity-5"
          priority
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex cursor-default items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 shadow-md ring-1 ring-white/50 dark:bg-amber-900/30 dark:text-amber-100"
            >
              <Sparkles className="h-4 w-4 animate-spin" />
              <span>Horneado fresco cada día</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mb-6 text-balance text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(217 119 6), rgb(234 88 12), rgb(234 179 8))",
                WebkitBackgroundClip: "text",
              }}
            >
              Bienvenido a Delicia
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mx-auto mb-10 max-w-3xl text-pretty text-lg leading-relaxed text-stone-600 dark:text-stone-300 sm:text-xl md:text-2xl"
            >
              El sabor artesanal de siempre, horneado con amor cada día.
              <br />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Descubre la tradición en cada bocado.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button asChild size="lg" variant="brand" className="w-full rounded-full px-8 py-6 text-lg sm:w-auto">
                <Link href="/catalogo" className="flex items-center justify-center">
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full border-2 px-8 py-6 text-lg sm:w-auto dark:hover:bg-amber-950/20"
              >
                <Link href="/registro" className="flex items-center justify-center">
                  Crear Cuenta
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Indicador scroll */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block">
          <div className="h-10 w-6 rounded-full border-2 border-amber-600/50 p-1">
            <div className="mx-auto h-3 w-1.5 animate-bounce rounded-full bg-amber-600" />
          </div>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="relative bg-white py-20 dark:bg-background md:py-28">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mx-auto mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              ¿Por qué elegirnos?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              La excelencia en cada detalle, con pasión por el arte de la panadería.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 260, damping: 20 } }}
              >
                <Card
                  className={`group border-none bg-gradient-to-br ${feature.gradient} shadow-lg backdrop-blur`}
                >
                  <CardContent className="px-6 pb-8 pt-8 text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg transition-transform group-hover:scale-110">
                      <feature.icon className="h-10 w-10 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold md:text-2xl">{feature.title}</h3>
                    <p className="leading-relaxed text-stone-600 dark:text-stone-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-gradient-to-b from-amber-50/50 to-transparent py-20 dark:from-amber-950/10 md:py-28">
        <div className="mx-auto w-full max-w-7xl px-4">
          <div className="mx-auto mb-16 text-center">
            <h2 className="mb-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Explora Nuestras Categorías
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Descubre nuestra amplia variedad de productos artesanales para cada ocasión.
            </p>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {categories.map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Link href={category.href} className="group block">
                  <Card className="h-full cursor-pointer overflow-hidden border-2 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl dark:hover:border-amber-700">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all group-hover:from-black/80" />
                      <div className="absolute inset-0 p-6">
                        <div className="flex h-full flex-col justify-end">
                          <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                              {category.name}
                            </h3>
                            <p className="text-sm text-amber-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:text-base">
                              {category.description}
                            </p>
                          </div>
                          <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                            <ArrowRight className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 py-20 text-white md:py-28">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
          >
            ¿Listo para disfrutar?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed opacity-95 md:text-xl"
          >
            Crea tu cuenta y comienza a disfrutar de nuestros productos artesanales.
            <span className="font-bold"> ¡Tu próximo antojo está a un clic de distancia!</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.16 }}
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/80 bg-white/90 px-8 py-6 text-lg font-bold text-stone-900 shadow-xl backdrop-blur transition-all hover:scale-105 hover:bg-white dark:border-white/20 dark:bg-stone-900/60 dark:text-white"
            >
              <Link href="/registro" className="flex items-center justify-center">
                Registrarse Ahora
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}