'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, MoreHorizontal, Edit2, Trash2, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/lib/supabase'

type Board = Database['public']['Tables']['boards']['Row']
type List = Database['public']['Tables']['lists']['Row']
type Card = Database['public']['Tables']['cards']['Row']

interface KanbanData {
  boards: Board[]
  lists: List[]
  cards: Card[]
}

export default function KanbanBoard() {
  const { user, signOut } = useAuth()
  const [data, setData] = useState<KanbanData>({ boards: [], lists: [], cards: [] })
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [newCardTitles, setNewCardTitles] = useState<{[listId: string]: string}>({})
  const [newListTitle, setNewListTitle] = useState('')

  useEffect(() => {
    if (user) {
      fetchData()
      const cleanup = setupRealtimeSubscriptions()
      return cleanup
    }
  }, [user])

  const createSampleData = async () => {
    try {
      // Create sample board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          title: 'My First Board',
          description: 'A sample Kanban board to get you started',
          user_id: user?.id
        })
        .select()
        .single()

      if (boardError) throw boardError

      // Create sample lists
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .insert([
          { title: 'To Do', board_id: board.id, position: 1 },
          { title: 'In Progress', board_id: board.id, position: 2 },
          { title: 'Done', board_id: board.id, position: 3 }
        ])
        .select()

      if (listsError) throw listsError

      // Create sample cards
      const todoListId = lists.find(list => list.title === 'To Do')?.id
      const inProgressListId = lists.find(list => list.title === 'In Progress')?.id

      if (todoListId && inProgressListId) {
        const { error: cardsError } = await supabase
          .from('cards')
          .insert([
            {
              title: 'Welcome to your Kanban board!',
              description: 'This is your first card. You can edit or delete it.',
              list_id: todoListId,
              position: 1
            },
            {
              title: 'Drag and drop cards',
              description: 'Try dragging this card to different lists',
              list_id: todoListId,
              position: 2
            },
            {
              title: 'Real-time updates',
              description: 'Changes appear instantly across all devices',
              list_id: inProgressListId,
              position: 1
            }
          ])

        if (cardsError) throw cardsError
      }

      // Return the created board to continue processing
      return board
    } catch (error) {
      console.error('Error creating sample data:', error)
      return null
    }
  }

  const fetchData = async () => {
    try {
      // Fetch boards
      const { data: boards, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })

      if (boardsError) throw boardsError

      // If user has no boards, create sample data
      if (!boards || boards.length === 0) {
        const newBoard = await createSampleData()
        if (!newBoard) return
        
        // Fetch again after creating sample data
        const { data: updatedBoards, error: updatedBoardsError } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (updatedBoardsError) throw updatedBoardsError
        
        // Use the updated boards data
        const firstBoard = updatedBoards[0]
        if (firstBoard) {
          setCurrentBoard(firstBoard)
          
          const { data: lists, error: listsError } = await supabase
            .from('lists')
            .select('*')
            .eq('board_id', firstBoard.id)
            .order('position', { ascending: true })

          if (listsError) throw listsError

          const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('*')
            .in('list_id', lists.map(list => list.id))
            .order('position', { ascending: true })

          if (cardsError) throw cardsError

          setData({ boards: updatedBoards || [], lists: lists || [], cards: cards || [] })
        }
        return
      }

      // Fetch lists for the first board
      const firstBoard = boards[0]
      if (firstBoard) {
        setCurrentBoard(firstBoard)
        
        const { data: lists, error: listsError } = await supabase
          .from('lists')
          .select('*')
          .eq('board_id', firstBoard.id)
          .order('position', { ascending: true })

        if (listsError) throw listsError

        // Fetch cards for these lists
        const { data: cards, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .in('list_id', lists.map(list => list.id))
          .order('position', { ascending: true })

        if (cardsError) throw cardsError

        setData({ boards: boards || [], lists: lists || [], cards: cards || [] })
      } else {
        setData({ boards: boards || [], lists: [], cards: [] })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Subscribe to all tables for real-time updates
    const subscription = supabase
      .channel('kanban-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boards' }, (payload) => {
        console.log('Board change:', payload)
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, (payload) => {
        console.log('List change:', payload)
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, (payload) => {
        console.log('Card change:', payload)
        // Small delay to avoid conflicts with optimistic updates
        setTimeout(() => {
          fetchData()
        }, 100)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // Don't do anything if dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const cardId = draggableId
    const sourceListId = source.droppableId
    const destinationListId = destination.droppableId
    const newPosition = destination.index

    // Optimistic update - update local state immediately
    setData(prevData => {
      const newData = { ...prevData }
      const cardToMove = newData.cards.find(card => card.id === cardId)
      
      if (!cardToMove) return prevData

      // Remove card from source position
      const sourceCards = newData.cards.filter(card => 
        card.list_id === sourceListId && card.id !== cardId
      ).sort((a, b) => a.position - b.position)

      // Update positions of remaining cards in source list
      sourceCards.forEach((card, index) => {
        card.position = index
      })

      // Update the moved card
      cardToMove.list_id = destinationListId
      cardToMove.position = newPosition

      // Get cards in destination list (excluding the moved card if it was in the same list)
      const destinationCards = newData.cards.filter(card => 
        card.list_id === destinationListId && card.id !== cardId
      ).sort((a, b) => a.position - b.position)

      // Insert the moved card at the new position
      destinationCards.splice(newPosition, 0, cardToMove)

      // Update positions of all cards in destination list
      destinationCards.forEach((card, index) => {
        card.position = index
      })

      // Rebuild the cards array
      const otherCards = newData.cards.filter(card => 
        card.list_id !== sourceListId && card.list_id !== destinationListId
      )

      newData.cards = [...otherCards, ...sourceCards, ...destinationCards]

      return newData
    })

    // Update database in the background
    try {
      if (sourceListId !== destinationListId) {
        // Moving card between lists
        const { error } = await supabase
          .from('cards')
          .update({ list_id: destinationListId, position: newPosition })
          .eq('id', cardId)

        if (error) throw error

        // Update positions of all affected cards
        const sourceCards = data.cards.filter(card => 
          card.list_id === sourceListId && card.id !== cardId
        )
        const destinationCards = data.cards.filter(card => 
          card.list_id === destinationListId && card.id !== cardId
        )

        // Update source list positions
        for (let i = 0; i < sourceCards.length; i++) {
          await supabase
            .from('cards')
            .update({ position: i })
            .eq('id', sourceCards[i].id)
        }

        // Update destination list positions
        for (let i = 0; i < destinationCards.length; i++) {
          const adjustedPosition = i >= newPosition ? i + 1 : i
          await supabase
            .from('cards')
            .update({ position: adjustedPosition })
            .eq('id', destinationCards[i].id)
        }
      } else {
        // Reordering within the same list
        const listCards = data.cards.filter(card => card.list_id === sourceListId)
        const sortedCards = listCards.sort((a, b) => a.position - b.position)
        
        // Remove the dragged card and insert it at the new position
        const draggedCard = sortedCards.find(card => card.id === cardId)
        const filteredCards = sortedCards.filter(card => card.id !== cardId)
        filteredCards.splice(newPosition, 0, draggedCard!)

        // Update positions for all cards in the list
        for (let i = 0; i < filteredCards.length; i++) {
          await supabase
            .from('cards')
            .update({ position: i })
            .eq('id', filteredCards[i].id)
        }
      }
    } catch (error) {
      console.error('Error updating card position:', error)
      // On error, refresh data to get the correct state
      fetchData()
    }
  }

  const addCard = async (listId: string) => {
    const cardTitle = newCardTitles[listId]?.trim()
    if (!cardTitle) return

    const tempId = `temp-${Date.now()}`
    const newCard = {
      id: tempId,
      title: cardTitle,
      description: null,
      list_id: listId,
      position: data.cards.filter(card => card.list_id === listId).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Optimistic update
    setData(prevData => ({
      ...prevData,
      cards: [...prevData.cards, newCard]
    }))

    // Clear the input for this specific list
    setNewCardTitles(prev => ({
      ...prev,
      [listId]: ''
    }))

    try {
      const { data: insertedCard, error } = await supabase
        .from('cards')
        .insert({
          title: cardTitle,
          list_id: listId,
          position: newCard.position
        })
        .select()
        .single()

      if (error) throw error

      // Replace temp card with real card
      setData(prevData => ({
        ...prevData,
        cards: prevData.cards.map(card => 
          card.id === tempId ? insertedCard : card
        )
      }))
    } catch (error) {
      console.error('Error adding card:', error)
      // Remove optimistic card on error
      setData(prevData => ({
        ...prevData,
        cards: prevData.cards.filter(card => card.id !== tempId)
      }))
      // Restore the text for this specific list
      setNewCardTitles(prev => ({
        ...prev,
        [listId]: cardTitle
      }))
    }
  }

  const addList = async () => {
    if (!newListTitle.trim() || !currentBoard) return

    const tempId = `temp-${Date.now()}`
    const newList = {
      id: tempId,
      title: newListTitle,
      board_id: currentBoard.id,
      position: data.lists.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Optimistic update
    setData(prevData => ({
      ...prevData,
      lists: [...prevData.lists, newList]
    }))

    const listTitle = newListTitle
    setNewListTitle('')

    try {
      const { data: insertedList, error } = await supabase
        .from('lists')
        .insert({
          title: listTitle,
          board_id: currentBoard.id,
          position: newList.position
        })
        .select()
        .single()

      if (error) throw error

      // Replace temp list with real list
      setData(prevData => ({
        ...prevData,
        lists: prevData.lists.map(list => 
          list.id === tempId ? insertedList : list
        )
      }))
    } catch (error) {
      console.error('Error adding list:', error)
      // Remove optimistic list on error
      setData(prevData => ({
        ...prevData,
        lists: prevData.lists.filter(list => list.id !== tempId)
      }))
      setNewListTitle(listTitle) // Restore the text
    }
  }

  const deleteCard = async (cardId: string) => {
    // Store the card for potential restoration
    const cardToDelete = data.cards.find(card => card.id === cardId)
    if (!cardToDelete) return

    // Optimistic update - remove immediately
    setData(prevData => ({
      ...prevData,
      cards: prevData.cards.filter(card => card.id !== cardId)
    }))

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting card:', error)
      // Restore card on error
      setData(prevData => ({
        ...prevData,
        cards: [...prevData.cards, cardToDelete].sort((a, b) => a.position - b.position)
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your boards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Kanban Pro</h1>
              {currentBoard && (
                <div className="ml-8">
                  <h2 className="text-lg font-medium text-gray-700">{currentBoard.title}</h2>
                  <p className="text-sm text-gray-500">{currentBoard.description}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto">
            {data.lists.map((list) => (
              <div key={list.id} className="flex-shrink-0 w-72">
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{list.title}</h3>
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-4 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {data.cards
                          .filter(card => card.list_id === list.id)
                          .map((card, index) => (
                            <Draggable
                              key={card.id}
                              draggableId={card.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-3 p-3 bg-white rounded-lg shadow-sm border ${
                                    snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-1">
                                        {card.title}
                                      </h4>
                                      {card.description && (
                                        <p className="text-sm text-gray-600">
                                          {card.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                      <button className="text-gray-500 hover:text-blue-600 p-1">
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteCard(card.id)}
                                        className="text-gray-500 hover:text-red-600 p-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                        
                        {/* Add card form */}
                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Add a card..."
                            value={newCardTitles[list.id] || ''}
                            onChange={(e) => setNewCardTitles(prev => ({
                              ...prev,
                              [list.id]: e.target.value
                            }))}
                            onKeyPress={(e) => e.key === 'Enter' && addCard(list.id)}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          {newCardTitles[list.id] && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => addCard(list.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Add Card
                              </button>
                              <button
                                onClick={() => setNewCardTitles(prev => ({
                                  ...prev,
                                  [list.id]: ''
                                }))}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
            
            {/* Add List */}
            <div className="flex-shrink-0 w-72">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <input
                  type="text"
                  placeholder="Add a list..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addList()}
                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {newListTitle && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={addList}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Add List
                    </button>
                    <button
                      onClick={() => setNewListTitle('')}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  )
} 