const {Router} = require('express')
const router = Router()
const Faq = require('../modeles/faq')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/',auth,async(req,res)=>{
    let faq = await Faq.find().lean()
    faq = faq.map((item,index)=> {
        item.index = index + 1
        item.status = item.status == 0 ? '<span class="badge bg-success">Активный</span>' : '<span class="badge bg-danger">Отключено</span>'
        item.createdAt = item.createdAt.toLocaleString()
        return item
    })
        res.render('faq',{
            title: 'Список вопросов',
            faq, 
            layout:'admin',
            isFaq:true,
            error: req.flash('error'),
            success: req.flash('success')
        })
})


router.get('/all',async(req,res)=>{
    let faq = await Faq.find({status:0}).sort({order:-1})
    res.send(faq)
})

router.get('/last',async(req,res)=>{
    let faq = await Faq.find({status:0}).sort({order:-1}).limit(6)
    res.send(faq)
})

router.get('/edit/:id',auth,async(req,res)=>{
    const _id = req.params.id
    const faq = await Faq.findOne({_id}).lean()
    res.send(faq)
})

router.post('/save',auth,async(req,res)=>{
    try {
        let {_id,question,answer,status} = req.body
        status = status || 0
        await Faq.findByIdAndUpdate(_id,{question,answer,status})
        res.send(JSON.stringify('ok'))
    } catch (error) {
        res.send(JSON.stringify(error))        
    }
})

router.get('/changestatus/:id/',auth,async(req,res)=>{
    const _id = req.params.id
    let faq = await Faq.findOne({_id})
    faq.status = faq.status == 0 ? 1 : 0
    await Faq.findByIdAndUpdate(_id,faq)
    await faq.save()
    res.send(JSON.stringify(faq.status))
})

router.get('/delete/:id',auth,async(req,res)=>{
    if (req.params){
        await Faq.findByIdAndDelete(req.params.id)
    }
    res.redirect('/faq')
})

router.post('/',auth,async(req,res)=>{
    let {question,answer,status} = req.body
    status = status || 0
    const faq = await new Faq({question,answer,status,createdAt:Date.now()})
    await faq.save()
    req.flash('success','Новая категория создано')
    res.redirect('/faq')
})

module.exports = router