import {defineArrayMember, defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required().max(120)}),
    defineField({name:'slug',title:'Slug',type:'slug',options:{source:'title',maxLength:80},validation:r=>r.required()}),
    defineField({name:'excerpt',title:'Short introduction',type:'text',rows:3,validation:r=>r.required().max(220)}),
    defineField({name:'coverImage',title:'Cover image',type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Alternative text',type:'string',validation:r=>r.required()})],validation:r=>r.required()}),
    defineField({name:'author',title:'Author',type:'reference',to:[{type:'author'}],validation:r=>r.required()}),
    defineField({name:'category',title:'Category',type:'reference',to:[{type:'category'}],validation:r=>r.required()}),
    defineField({name:'featured',title:'Feature in TeleMedia',type:'boolean',initialValue:false}),
    defineField({name:'clinicalReviewRequired',title:'Clinical review required',type:'boolean',initialValue:false}),
    defineField({name:'clinicalReviewer',title:'Clinical reviewer',type:'string',hidden:({document})=>!document?.clinicalReviewRequired}),
    defineField({name:'clinicalReviewStatus',title:'Clinical review status',type:'string',options:{list:[{title:'Not required',value:'not_required'},{title:'Pending',value:'pending'},{title:'Approved',value:'approved'},{title:'Changes requested',value:'changes_requested'}]},initialValue:'not_required'}),
    defineField({name:'body',title:'Article body',type:'array',of:[defineArrayMember({type:'block'}),defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Alternative text',type:'string',validation:r=>r.required()}),defineField({name:'caption',title:'Caption',type:'string'})]})],validation:r=>r.required().min(1)}),
    defineField({name:'seoTitle',title:'SEO title',type:'string',validation:r=>r.max(60)}),
    defineField({name:'seoDescription',title:'SEO description',type:'text',rows:2,validation:r=>r.max(160)}),
    defineField({name:'publishedAt',title:'Published at',type:'datetime'}),
    defineField({name:'updatedAt',title:'Editorial updated at',type:'datetime'}),
  ],
  preview:{select:{title:'title',subtitle:'excerpt',media:'coverImage'}},
})
