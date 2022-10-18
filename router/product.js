const {Router} = require('express')
const router = Router()
const Product = require('../modeles/product')
const Order = require('../modeles/order')
const Feedback = require('../modeles/feedback')
const Category = require('../modeles/category')
const auth = require('../middleware/auth')
const csrf = require('csurf')
const csrfProtection = csrf({ cookie: true }) 

router.get('/',auth,async(req,res)=>{
    let products = await Product.find().populate('category').lean()
    products = products.map((product,index) => {
        product.index = index+1
        return product
    })
    console.log(products)
    const category = await Category.find().lean()
    res.render('product/index',{
        title: 'Курсы',
        layout:'admin',
        category,
        isProduct:true,
        products
    })
})

router.get('/order',auth,async(req,res)=>{
    let order = await Order.find().populate('product').lean()
    order = order.map((o,index) =>{
        o.index = index + 1
        o.createdAt = o.createdAt.toLocaleString('ru-RU')
        return o
    })
    res.render('product/order',{
        title:'Заказы',
        layout:'admin',
        order,
        isOrder:true
    })
})
router.get('/feedback',auth,async(req,res)=>{
    let feedback = await Feedback.find().lean()
    feedback = feedback.map((o,index) =>{
        o.index = index + 1
        o.createdAt = o.createdAt.toLocaleString('ru-RU')
        return o
    })
    res.render('product/feedback',{
        title:'Заявка на звонок',
        layout:'admin',
        feedback,
        isFeedback:true
    })
})

router.post('/order',async(req,res)=>{
    if (req.body){
        let {product,comment,email,type, name, phone} = req.body 
        type = type || 0
        let newOrder = await new Order({product,name,phone,comment,email,type,createdAt:Date.now()})
        await newOrder.save()
        res.send('ok')
    }
})
router.get('/orderdel/:id',auth,async(req,res)=>{
    if (req.params){
        let {id} = req.params
        await Order.findByIdAndRemove(id)
        res.redirect('/product/order')
    }
})
router.get('/feedbackdel/:id',auth,async(req,res)=>{
    if (req.params){
        let {id} = req.params
        await Feedback.findByIdAndRemove(id)
        res.redirect('/product/feedback')
    }
})
router.post('/feedback',async(req,res)=>{
    if (req.body){
        let {comment,email,type, name, phone} = req.body 
        type = type || 0
        let newOrder = await new Feedback({name,phone,comment,email,type,createdAt:Date.now()})
        console.log(newOrder)
        await newOrder.save()
        res.send('ok')
    }
})

router.get('/create',auth,async(req,res)=>{
    const category = await Category.find().lean()
    res.render('product/new',{
        title: 'Yangi tovarni kiritish',
        isProduct:true,
        category
    })
})


router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    await Product.findByIdAndDelete({_id})
    res.redirect('/product/')
})

router.post('/',auth,async(req,res)=>{
    try {
        let {title,price,category,text,status,parts,time} = req.body
        // console.log(currency)
        status = status || 0
        let createdAt = new Date().toISOString()
        if (req.files){
            let files = req.files
            let img = ''
            const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            for(key in files){
                let filepath = `images/${uniquePreffix}_${files[key].name}`
                await files[key].mv(filepath)
                img =filepath
            }
            const product = await new Product({title,price,parts,time,category,text,status,img,createdAt})
            await product.save()
            res.send(product)
        } else {
            res.send('error')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/save',auth,async(req,res)=>{
    let {_id,title,price,category,top,text,stock,status} = req.body
    top = top || 0
    status = status || 0
    let product = {title,price,category,top,text,stock,status}
    if (req.files){
        let files = req.files
        let img = []
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        for(key in files){
            let filepath = `images/${uniquePreffix}_${files[key].name}`
            await files[key].mv(filepath)
            img.push(filepath)
        }
        product.img = img
    }
    // console.log(ads,_id)
    await Product.findByIdAndUpdate({_id},product)
    res.send(JSON.stringify('ok'))
})

router.get('/get/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const product = await Product.findOne({_id}).lean()
    res.send(product)
})

router.get('/show/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const product = await Product.findOne({_id}).populate('categoryId').lean()
        product.newPrice = product.price*(100-product.sale)/100
        res.render('product/view',{
            title: `${product.categoryId.name} | ${product.title} | ${product.price} so'm`,
            product,
            isProduct:true,
        })
    
})

router.get('/view/:id',async(req,res)=>{
    const _id = req.params.id
    let product = await Product.findOne({_id}).select(['title','price','sale','pimg','detail']).lean()
    res.send(product)
})

router.get('/getbycat/:slug',async(req,res)=>{
    if (req.params){
        let {slug} = req.params
        let category = await Category.findOne({slug}).lean()
        let products = await Product.find({category: category._id})
        res.send(products)
    }
})

router.get('/getall',async(req,res)=>{
    let products = await Product.find().lean()
    res.send(products)
})

module.exports = router