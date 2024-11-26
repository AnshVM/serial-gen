import { Button, Input, useToast } from '@chakra-ui/react'
import { useState } from 'react'

export default function CreateModel() {
  // name code productName

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [productName, setProductName] = useState('')
  const toast = useToast()

  const handleSaveModel = async () => {
    console.log(name, code, productName)
    const ok = await window.api.createModel(name, code, productName)
    console.log(ok)
    if (!ok) {
      toast({
        title: 'Save failed',
        description: 'There was an error while saving the model',
        status: 'error',
        duration: 9000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Model saved',
        description: 'Model was saved successfully',
        status: 'success',
        duration: 9000,
        isClosable: true
      })
    }
  }

  return (
    <div className="pt-4 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-center text-teal-700">Create Model</h1>
      <div className="flex flex-row gap-4 px-4">
        <Input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Model code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input
          placeholder="Product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>
      <Button
        colorScheme="teal"
        variant={'solid'}
        className="w-fit mx-auto"
        onClick={handleSaveModel}
      >
        Create Model
      </Button>
    </div>
  )
}
