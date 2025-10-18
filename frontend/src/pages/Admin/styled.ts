import styled from "styled-components";

export const ListItem = styled('li')(() => {
    return {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
    }
})

export const List = styled('ul')(() => ({
    display: 'grid',
    gap: '1rem',
    marginTop: '1rem'
}))