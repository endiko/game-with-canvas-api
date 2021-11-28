const canvas = document.querySelector('#canvas')
const c = canvas.getContext('2d')
const scoreElem = document.querySelector('.score-text')
const modal = document.querySelector('.modal')
const modalScoreElem = document.querySelector('.modal-score')
const startGameBtn = document.querySelector('.modal-button')


canvas.width = innerWidth
canvas.height = innerHeight 

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;

    this.radius = radius; 
    this.color = color;
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;

    this.radius = radius; 
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;

    this.radius = radius; 
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;

    this.radius = radius; 
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.alpha -= 0.01
  }
}

let x = canvas.width / 2
let y = canvas.height / 2

let player = new Player(x, y, 10, 'white')

let projectiles = []
let enemies = [] 
let particles = []

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10
    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    enemies.push(new Enemy(
      x, y, radius, `hsl(${Math.random() * 360}, 50%, 50%)`, velocity
    ))
  }, 1000)
}

let animationId
let score = 0

function animate() {
  animationId = requestAnimationFrame(animate)

  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()

  particles.forEach((particle, idx) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(idx, 1)
      }, 0)
    } else {
      particle.update()
    }
  })

  projectiles.forEach((projectile, idx) => {
    projectile.update()

    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {
      // remove projectile from game
      setTimeout(() => {
        projectiles.splice(idx, 1)
      }, 0)
    }
  })

  enemies.forEach((enemy, idx) => {
    enemy.update()

    const distWithPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    if (distWithPlayer - enemy.radius - player.radius < 1) {
      modalScoreElem.textContent = score;
      modal.classList.add('open')
      cancelAnimationFrame(animationId)
    }

    projectiles.forEach((projectile, pIdx) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectile hits the enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        score += 100
        scoreElem.textContent = score;

        // create explosions
        for (let i = 0; i < 8; i++){
          particles.push(new Particle(
            projectile.x,
            projectile.y,
            Math.random() * 2,
            enemy.color,
            {
              x: (Math.random() - 0.5) * (Math.random() * 5),
              y: (Math.random() - 0.5) * (Math.random() * 5)
            }
          ))
        }

        if (enemy.radius - 10 > 5) {
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          setTimeout(() => {
            projectiles.splice(pIdx, 1)
          }, 0)
        } else {
          setTimeout(() => {
            enemies.splice(idx, 1)
            projectiles.splice(pIdx, 1)
          }, 0)
        }
      }
    })
  })
}

window.addEventListener('click', (e) => {
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }

  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})


startGameBtn.addEventListener('click', (e) => {
  modal.classList.remove('open')
  score = 0
  x = canvas.width / 2
  y = canvas.height / 2

  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = [] 
  particles = []
  animate()
  spawnEnemies()
})

