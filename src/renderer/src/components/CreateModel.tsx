import { DeleteIcon } from '@chakra-ui/icons'
import {
  Button,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react'
import { Model } from '@renderer/types'
import { useEffect, useState } from 'react'
import PasswordModal from './PasswordModal'

export enum ProductNames {
  InfiniPlus = 'InfiniPlus',
  InfiniPro = 'InfiniPro',
  InfiniStor = 'InfiniStor',
  DataBox = 'DataBox'
}

export default function CreateModel() {
  // name code productName

  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [models, setModels] = useState<Model[]>([])
  const [productName, setProductName] = useState(ProductNames.InfiniPlus)
  const toast = useToast()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

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

  const refreshModels = () => {
    if (productName) {
      window.api
        .getModelsByProductName(productName)
        .then((models: Model[]) => {
          setModels(models)
        })
        .catch(() => console.log('Error while fetching models'))
    }
  }

  const initiateDelete = (model: Model) => {
    setSelectedModel(model)
    setPassword('')
    setPasswordError(false)
    setIsPasswordModalOpen(true)
  }

  const handleDelete = async () => {
    if (password === 'Esdee2024@' && selectedModel) {
      await window.api.deleteModelByModelName(selectedModel.name)
      refreshModels()
      setIsPasswordModalOpen(false)
    } else {
      setPasswordError(true)
    }
  }

  useEffect(() => {
    refreshModels()
  })

  return (
    <div className="pt-4 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-center text-teal-700">Create Model</h1>
      <div className="flex flex-row gap-4 px-4">
        <Input placeholder="Model name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Model code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Select
          value={productName}
          onChange={(e) => setProductName(e.target.value as ProductNames)}
        >
          <option value={ProductNames.InfiniPlus}>{ProductNames.InfiniPlus}</option>
          <option value={ProductNames.InfiniPro}>{ProductNames.InfiniPro}</option>
          <option value={ProductNames.InfiniStor}>{ProductNames.InfiniStor}</option>
          <option value={ProductNames.DataBox}>{ProductNames.DataBox}</option>
        </Select>
      </div>
      <Button
        colorScheme="teal"
        variant={'solid'}
        className="w-fit mx-auto"
        onClick={handleSaveModel}
      >
        Create Model
      </Button>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        setPasswordError={setPasswordError}
        handleDelete={handleDelete}
      />

      <TableContainer>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Product name</Th>
              <Th>Code</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {models &&
              models.map((model: Model) => (
                <Tr key={model.name + model.code + model.productName}>
                  <Td>{model.name}</Td>
                  <Td>{model.productName}</Td>
                  <Td>{model.code}</Td>
                  <Td>
                    <DeleteIcon
                      cursor={'pointer'}
                      color={'red'}
                      onClick={() => initiateDelete(model)}
                    />
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  )
}
