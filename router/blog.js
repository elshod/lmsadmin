const {Router} = require('express')
const router = Router()
const Blog = require('../modeles/blog')
const auth = require('../middleware/auth')

router.get('/',auth,async(req,res)=>{
    let blogs = await Blog.find().lean()
    blogs = blogs.map((blog,index) => {
        blog.index = index+1
        return blog
    })
    res.render('blog/index',{
        title: 'Блог',
        layout:'admin',
        isBlog:true,
        blogs
    })
})



router.get('/delete/:id',auth,async(req,res)=>{
    const _id = req.params.id
    await Blog.findByIdAndDelete({_id})
    res.redirect('/blog/')
})

router.post('/',auth,async(req,res)=>{
    try {
        let {title,type,text,status} = req.body
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
                img = filepath
            }
            const blog = await new Blog({title,type,text,status,img,createdAt})
            await blog.save()
            res.send(blog)
        } else {
            res.send('error')
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/save',auth,async(req,res)=>{
    let {_id,title,type,text,status,createdAt} = req.body
    top = top || 0
    status = status || 0
    let blog = {title,type,text,status,createdAt}
    if (req.files){
        let files = req.files
        let img = ''
        const uniquePreffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        for(key in files){
            let filepath = `images/${uniquePreffix}_${files[key].name}`
            await files[key].mv(filepath)
            img = filepath
        }
        blog.img = img
    }
    await Blog.findByIdAndUpdate({_id},blog)
    res.send(JSON.stringify('ok'))
})



router.get('/view/:id',async(req,res)=>{
    const _id = req.params.id
    let blog = await Blog.findOne({_id}).lean()
    let others = await Blog.find({_id: {$ne: _id}}).limit(5).sort({_id:-1})
    res.send({blog,others})
})

router.get('/getbytype/:id',async(req,res)=>{
    if (req.params){
        let {id} = req.params
        let blogs = await Blog.find({type: id})
        res.send(blogs)
    }
})

router.get('/getall',async(req,res)=>{
    let blogs = await Blog.find().lean()
    res.send(blogs)
})

router.get('/last',async(req,res)=>{
    let blogs = await Blog.find().sort({_id:-1}).limit(3).lean()
    res.send(blogs)
})

module.exports = router