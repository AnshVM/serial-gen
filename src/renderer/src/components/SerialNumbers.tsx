import { Button, Input, Select, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { Model, SerialNumber } from "@renderer/types";
import { useEffect, useState } from "react"

export default function SerialNumbers() {

    const [serials, setSerials] = useState<SerialNumber[]>();
    const [models, setModels] = useState<Model[]>();
    const [modelName, setModelName] = useState('');
    const [startDate, setStartDate] = useState<Date>(new Date(0));
    const [endDate, setEndDate] = useState<Date>(new Date());

    const getModel = (serialNumber: SerialNumber) => {
        return models?.find(model => serialNumber.modelName === model.name)
    }

    const applyFilters = () => {
        window.api.filterSerialNumbers({
            modelName: modelName !== '' ? modelName : undefined,
            startDate, 
            endDate
        })
            .then((res) => setSerials(res))
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        window.api.filterSerialNumbers({})
            .then((res) => setSerials(res))
            .catch((err) => console.log(err));

        window.api.getModels()
            .then(res => {
                res.push({ name: '', code: '', productName: '' });
                setModels(res.reverse());
            })
            .catch(err => console.log(err));
    }, [])


    return (
        <div className="pl-2">
            <h1 className="text-3xl font-semibold text-center text-teal-700">
                Serial Numbers
            </h1>

            <div className='flex flex-row justify-center gap-4'>
                <Select
                    value={modelName}
                    onChange={e => setModelName(e.target.value)}
                >
                    {models && models.map(model => (
                        <option value={model.name}>{model.name}-{model.productName}</option>
                    ))}
                </Select>
                <Input
                    onChange={(e) => {
                        setStartDate(new Date(e.target.value))
                    }}
                    value={startDate.toISOString().split('T')[0]}
                    type='date'
                />
                <Input
                    onChange={(e) => {
                        setEndDate(new Date(e.target.value))
                    }}
                    value={endDate.toISOString().split('T')[0]}
                    type='date'
                />

            </div>
            <Button className='my-4' colorScheme="teal" onClick={applyFilters}>Apply filters</Button>

            <TableContainer>
                <Table variant={'simple'}>
                    <Thead>
                        <Tr>
                            <Th>Serial</Th>
                            <Th>Date</Th>
                            <Th>Company</Th>
                            <Th>Model</Th>
                            <Th>Sequence</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {serials && serials.map(serial => (
                            <Tr>
                                <Td>{serial.serial}</Td>
                                <Td>{serial.createdAt.toDateString()}</Td>
                                <Td>{serial.company}</Td>
                                <Td>{serial.modelName}-{getModel(serial)?.productName}</Td>
                                <Td>{serial.sequence.toString().padStart(4, '0')}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

        </div>
    )
}