// Import des dépendances
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import mongoose from 'mongoose'
await mongoose.connect('mongodb://localhost:27017/sproutify')

// Nous verrons plus tard ce que sont les typeDefs et resolvers
const ALL_MUSICS = [
    {
        id: '1',
        title: 'Rock you like a hurricane',
        artist: 'Scorpions',
        album: 'Love at first sting',
        year: 1984,
        genre: 'Hard rock',
    },
    {
        id: '2',
        title: 'Nothing else matters',
        artist: 'Metallica',
        album: 'Metallica',
        year: 1991,
        genre: 'Heavy metal',
    },
]

const Dish = mongoose.model('Dish', {
    title: String,
    description: String,
    price: Number,
    image: String,
    })

const Cart = mongoose.model('Cart', {
    dishes: [Dish.schema],
    isPaid: Boolean,
    adress: String,
    zipcode: String,
    city: String,
    })



// On définit le schéma de notre API
const typeDefs = `#graphql
    type Dish {
        id: ID!
        title: String!
        description: String!
        price: Float!
        image: String!
    }

    type Cart {
        id: ID!
        Dishes: [Dish]!
        isPaid: Boolean!
        adress: String!
        zipcode: String!
        city: String!
    }

    type Query {
        dishes: [Dish]!
        dish(id: ID!): Dish
        cart(id: ID!): Cart
        carts: [Cart]!

    }

    type Mutation {
        addDish(title: String!, description: String!, price: Float!, image: String!): Dish!
        updateDish(id: ID!, title: String, description: String, price: Float, image: String): Dish!
        deleteDish(id: ID!): Dish!
        initCart: Cart!
        addDishToCart(id: ID!,dishId: ID!): Cart!
        removeDishFromCart(id: ID!, DishId: ID!): Cart!
        updateDeliveryAdress(id: ID!, adress: String!, zipcode: String!, city: String!): Cart!
        deleteCart(id: ID!): Cart!
        payCart(id: ID!): Cart!
    }
`
// On laisse l'objet vide pour le moment
const resolvers = {
    Query: {
        dishes: async () => {
            return await Dish.find()
        },
        dish: async (parent, args) => {
            const { id } = args
            const dish = await Dish.findById(id)
            return dish
        },
        cart: async (parent, args) => {
            const { id } = args
            const cart = await Cart.findById(id)
            return cart
        },
    },
    Mutation: {
        addDish: async (parent, args) => {
            const { title, description, price, image } = args
            const dish = new Dish({ title, description, price, image })
            await dish.save()
            return dish
        },
        updateDish: async (parent, args) => {
            const { id, title, description, price, image } = args
            const dish = await Dish.findByIdAndUpdate(id, { title, description, price, image })
            return dish
        },
        deleteDish: async (parent, args) => {
            const { id } = args
            const dish = await Dish.findByIdAndDelete(id)
            return dish
        },
        initCart: async (parent, args) => {
            const cart = new Cart({ dishes: [], isPaid: false })
            await cart.save()
            return cart
        },
        addDishToCart: async (parent, args) => {
            const { id, dishId } = args
            const cart = await Cart.findById(id)
            const dish = await Dish.findById(dishId)
            cart.dishes.push(dish)
            await cart.save()
            return cart
        },
        removeDishFromCart: async (parent, args) => {
            const { id, dishId } = args
            const cart = await Cart.findById(id)
            const dish = await Dish.findById(dishId)
            cart.dishes.pull(item)
            await cart.save()
            return cart
        },
        deleteCart: async (parent, args) => {
            const { id } = args
            const cart = await Cart.findByIdAndDelete(id)
            return cart
        },
        payCart: async (parent, args) => {
            const { id } = args
            const cart = await Cart.findByIdAndUpdate(id, { isPaid: true })
            return cart
        }

    },
}



// Création de l'instance Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
})

// Démarrage du serveur
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
})

// Message de confirmation que le serveur est bien lancé
console.log(`🚀  Le serveur tourne sur: ${url}`)