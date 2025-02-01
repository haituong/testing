import React from 'react'
import LayoutComponent from '@/components/Layout/LayoutComponent'
const RootLayout = ({children}) => {
  return (
    <LayoutComponent>{children}</LayoutComponent>
  )
}

export default RootLayout