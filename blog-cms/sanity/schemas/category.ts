import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({name:'title',title:'Title',type:'string',validation:r=>r.required().max(60)}),
    defineField({name:'slug',title:'Slug',type:'slug',options:{source:'title',maxLength:60},validation:r=>r.required()}),
    defineField({name:'description',title:'Description',type:'text',rows:3,validation:r=>r.max(180)}),
  ],
})
