import { ArrowDownIcon } from '@chakra-ui/icons'
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
  Tr
} from '@chakra-ui/react'
import { Model, SerialNumber } from '@renderer/types'
import { useEffect, useState } from 'react'

export default function SerialNumbers() {
  const [serials, setSerials] = useState<SerialNumber[]>()
  const [models, setModels] = useState<Model[]>()
  const [modelName, setModelName] = useState('')
  const [startDate, setStartDate] = useState<Date>(new Date(0))
  const [endDate, setEndDate] = useState<Date>(new Date())

  const getModel = (serialNumber: SerialNumber) => {
    return models?.find((model) => serialNumber.modelName === model.name)
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
      modelName
    )
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

  useEffect(() => {
    window.api
      .filterSerialNumbers({})
      .then((res) => setSerials(res))
      .catch((err) => console.log(err))

    window.api
      .getModels()
      .then((res) => {
        res.push({ name: '', code: '', productName: '' })
        setModels(res.reverse())
      })
      .catch((err) => console.log(err))
  }, [])

  const dateToString = (date: Date) => {
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="pl-2 bg-white shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-semibold text-center text-teal-700">Serial Numbers</h1>

        <div className="flex flex-row justify-center gap-4 mt-4">
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
                <Th>Date</Th>
                <Th>Company</Th>
                <Th>Model</Th>
                <Th>Sequence</Th>
              </Tr>
            </Thead>
            <Tbody>
              {serials &&
                serials.map((serial, idx) => (
                  <Tr key={serial.serial}>
                    <Td>{idx}</Td>
                    <Td>{serial.serial}</Td>
                    <Td>{serial.createdAt.toDateString()}</Td>
                    <Td>{serial.company}</Td>
                    <Td>
                      {serial.modelName}-{getModel(serial)?.productName}
                    </Td>
                    <Td>{serial.sequence.toString().padStart(4, '0')}</Td>
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
