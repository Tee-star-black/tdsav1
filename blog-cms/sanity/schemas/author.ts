import {defineField, defineType} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({name:'name',title:'Name',type:'string',validation:r=>r.required().max(80)}),
    defineField({name:'role',title:'Role',type:'string',validation:r=>r.max(100)}),
    defineField({name:'bio',title:'Short bio',type:'text',rows:3,validation:r=>r.max(240)}),
    defineField({name:'photo',title:'Photo',type:'image',options:{hotspot:true}}),
  ],
  preview:{select:{title:'name',subtitle:'role',media:'photo'}},
})
