import {render,screen,fireEvent} from '@testing-library/react'
import {describe,expect,it} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {SubnetCalculatorPage} from '../features/subnet-calculator/presentation/SubnetCalculatorPage'
import {LocaleProvider} from '../app/providers/LocaleProvider'
describe('calculator UI',()=>{
  it('shows an accessible error and clears outdated results',()=>{render(<LocaleProvider><MemoryRouter><SubnetCalculatorPage/></MemoryRouter></LocaleProvider>);expect(screen.getByText('192.168.1.0/26')).toBeInTheDocument();fireEvent.change(screen.getByLabelText('IPv4 address'),{target:{value:'192.168.1.999'}});fireEvent.click(screen.getByRole('button',{name:/Calculate subnet/}));expect(screen.getByRole('alert')).toHaveTextContent('valid IPv4 address');expect(screen.queryByText('192.168.1.0/26')).not.toBeInTheDocument()})
})
