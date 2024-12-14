import { ArrowDownIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, CopyIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  IconButton,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Tooltip,
  useToast
} from '@chakra-ui/react'
import { Model, SerialNumber } from '@renderer/types'
import { useEffect, useState } from 'react'
import { ProductNames } from './CreateModel'

const dateToString = (date: Date) => {
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - offset * 60 * 1000)
  return date.toISOString().split('T')[0]
}

let allModels: Model[] = []

export default function SerialNumbers() {
  const [productName, setProcutName] = useState<ProductNames | 'any'>('any')
  const [serials, setSerials] = useState<SerialNumber[]>()
  const [models, setModels] = useState<Model[]>()
  const [modelName, setModelName] = useState('')
  const [startDate, setStartDate] = useState<Date>(new Date(0))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [sortColumn, setSortColumn] = useState<'sr' | 'sequence' | 'date'>('sr')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toast = useToast()

  const toggleSort = (column: 'sr' | 'sequence' | 'date') => {
    if (sortColumn === column) {
      // Toggle direction if the same column is clicked
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      // Set the column and default direction to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedSerials = () => {
    if (!serials) return []
    const sorted = [...serials]
    sorted.sort((a, b) => {
      let valA, valB

      if (sortColumn === 'sr') {
        valA = serials.indexOf(a)
        valB = serials.indexOf(b)
      } else if (sortColumn === 'sequence') {
        valA = a.sequence
        valB = b.sequence
      } else if (sortColumn === 'date') {
        valA = new Date(a.createdAt).getTime()
        valB = new Date(b.createdAt).getTime()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }

  const getModel = (serialNumber: SerialNumber) => {
    return allModels?.find((model) => serialNumber.modelName === model.name)
  }

  const applyFilters = () => {
    window.api
      .filterSerialNumbers({
        modelName: modelName !== '' ? modelName : undefined,
        startDate,
        endDate
      })
      .then((res) => setSerials(res))
      .catch((err) => console.log(err))
  }

  const handleDownload = async () => {
    await window.api.saveFile(
      generateCsv(),
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      modelName,
      serials ? serials.map(serial => serial.serial) : []
    )
  }

  const handleDelete = async (serial: string) => {
    await window.api.deleteSerial(serial)
    refresh()
  }

  const generateCsv = () => {
    let rows = [['Serial', 'Date', 'Company', 'Model', 'Sequence'].join(',')]
    if (serials) {
      for (const s of serials) {
        const row = [
          s.serial,
          s.createdAt.toISOString().split('T')[0],
          s.company,
          `${s.modelName}-${getModel(s)?.productName}`,
          s.sequence.toString().padStart(4, '0')
        ]
        rows.push(row.join(','))
      }
    }
    return rows.join('\n')
  }

  const refresh = () => {
    window.api
      .filterSerialNumbers({})
      .then((res) => setSerials(res))
      .catch((err) => console.log(err))

    window.api
      .getModels()
      .then((res) => {
        allModels = res
        res.push({ name: '', code: '', productName: '' })
        setModels(res.reverse())
      })
      .catch((err) => console.log(err))
  }

  const handleCopy = (serial: string) => {
    navigator.clipboard.writeText(serial)
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top'
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    console.log(productName)
    if (productName === 'any') return
    console.log(productName)
    window.api
      .getModelsByProductName(productName)
      .then((res) => {
        res.push({ name: '', code: '', productName: '' })
        setModels(res.reverse())
      })
      .catch((err) => console.log(err))
  }, [productName])

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="pl-2 bg-white shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-semibold text-center text-teal-700">Serial Numbers</h1>

        <div className="flex flex-row justify-center gap-4 mt-4">
          <Select
            value={productName.toString()}
            onChange={(e) => setProcutName(e.target.value as ProductNames | 'any')}
          >
            <option key={0} value="any">
              All
            </option>
            <option key={1} value={ProductNames.Databox}>
              {ProductNames.Databox}
            </option>
            <option key={2} value={ProductNames.InfiniPlus}>
              {ProductNames.InfiniPlus}
            </option>
            <option key={3} value={ProductNames.InfiniPro}>
              {ProductNames.InfiniPro}
            </option>
            <option key={4} value={ProductNames.InfiniStor}>
              {ProductNames.InfiniStor}
            </option>
          </Select>
          <Select value={modelName} onChange={(e) => setModelName(e.target.value)}>
            {models &&
              models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name}-{model.productName}
                </option>
              ))}
          </Select>
          <Input
            onChange={(e) => {
              console.log(e.target.value)
              setStartDate(new Date(e.target.value))
            }}
            value={dateToString(startDate)}
            type="date"
          />
          <Input
            onChange={(e) => {
              console.log(e.target.value)
              setEndDate(new Date(e.target.value))
            }}
            value={dateToString(endDate)}
            type="date"
          />
        </div>
        <Button className="my-4" colorScheme="teal" onClick={applyFilters}>
          Apply filters
        </Button>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 overflow-auto">
        <TableContainer>
          <Table variant={'simple'}>
            <Thead>
              <Tr>
                <Th>Sr</Th>
                <Th>Serial</Th>
                <Th>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleSort('date')}
                  >
                    Date
                    {sortColumn === 'date' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUpIcon ml={1} />
                      ) : (
                        <ChevronDownIcon ml={1} />
                      ))}
                  </div>
                </Th>
                <Th>Company</Th>
                <Th>Model</Th>
                <Th>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleSort('sequence')}
                  >
                    Sequence
                    {sortColumn === 'sequence' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUpIcon ml={1} />
                      ) : (
                        <ChevronDownIcon ml={1} />
                      ))}
                  </div>
                </Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedSerials().map((serial, idx) => (
                <Tr key={serial.serial}>
                  <Td>{idx}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      {serial.serial}
                      <Tooltip label="Copy serial number">
                        <IconButton
                          aria-label="Copy serial number"
                          icon={<CopyIcon />}
                          size="sm"
                          onClick={() => handleCopy(serial.serial)}
                          variant="ghost"
                        />
                      </Tooltip>
                    </div>
                  </Td>
                  <Td>{serial.createdAt.toDateString()}</Td>
                  <Td>{serial.company}</Td>
                  <Td>
                    {serial.modelName}-{getModel(serial)?.productName}
                  </Td>
                  <Td>{serial.sequence.toString().padStart(4, '0')}</Td>
                  <Td>
                    <DeleteIcon
                      cursor={'pointer'}
                      color={'red'}
                      onClick={async () => await handleDelete(serial.serial)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </div>

      {/* Floating Download Button */}
      <Box position="fixed" bottom={4} right={4} zIndex={2}>
        <IconButton
          onClick={handleDownload}
          aria-label="Download button"
          colorScheme="blue"
          icon={<ArrowDownIcon />}
        />
      </Box>
    </div>
  )
}
