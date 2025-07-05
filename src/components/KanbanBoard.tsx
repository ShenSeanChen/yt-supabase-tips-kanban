'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, MoreHorizontal, Edit2, Trash2, LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/lib/supabase'

// 🎯 TypeScript Integration (Feature #4: Auto-generated APIs)
type Board = Database['public']['Tables']['boards']['Row']
type List = Database['public']['Tables']['lists']['Row']
type Card = Database['public']['Tables']['cards']['Row']

interface KanbanData {
  boards: Board[]
  lists: List[]
  cards: Card[]
}

export default function KanbanBoard() {
  // 🔐 FEATURE #1: Authentication (using AuthContext)
  const { user, signOut } = useAuth()
  
  // 📊 State Management
  const [data, setData] = useState<KanbanData>({ boards: [], lists: [], cards: [] })
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [newCardTitles, setNewCardTitles] = useState<{[listId: string]: string}>({})
  const [newListTitle, setNewListTitle] = useState('')
  
  // 🎉 Notification State (Feature #6: Edge Functions)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({ show: false, message: '', type: 'success' })

  // 🚀 Initialize App: Data + Real-time
  useEffect(() => {
    if (user) {
      fetchData()
      
      // STEP 1: Start listening to database changes
      const cleanup = setupRealtimeSubscriptions() // Feature #3: Real-time
      
      // STEP 2: Return cleanup function - React will call this when:
      // - Component unmounts (user navigates away)
      // - Dependencies change (user logs out)
      // - Component re-renders and needs to cleanup old subscriptions
      return cleanup
      
      // ❌ WITHOUT CLEANUP: 
      // - WebSocket connections stay open forever
      // - Multiple subscriptions pile up
      // - Memory leaks and performance issues
      // - App becomes slow and buggy
    }
  }, [user]) // When 'user' changes, cleanup old subscription and start new one

  // ===============================================
  // 🎯 FEATURE #3: REAL-TIME SUBSCRIPTIONS
  // ===============================================
  
  const setupRealtimeSubscriptions = () => {
    console.log('🔄 Setting up real-time subscriptions...')
    
    // CREATE: Open WebSocket connection to Supabase
    const subscription = supabase
      .channel('kanban-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'boards' 
      }, (payload) => {
        console.log('📋 Board updated in real-time:', payload)
        fetchData()
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lists' 
      }, (payload) => {
        console.log('📝 List updated in real-time:', payload)
        fetchData()
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'cards' 
      }, (payload) => {
        console.log('🎴 Card updated in real-time:', payload)
        // Small delay to avoid conflicts with optimistic updates
        setTimeout(() => fetchData(), 100)
      })
      .subscribe() // 🔌 This opens the WebSocket connection

    // RETURN: A function that closes the WebSocket connection
    // React will call this function when cleanup is needed
    return () => {
      console.log('🧹 Cleaning up real-time subscriptions')
      subscription.unsubscribe() // 🔌 This closes the WebSocket connection
    }
    
    // 💡 EXPLANATION:
    // 1. We create a subscription (opens WebSocket)
    // 2. We return a function that unsubscribes (closes WebSocket) 
    // 3. React automatically calls our returned function when needed
    // 4. This prevents memory leaks and multiple connections
  }

  // ===============================================
  // 🎯 FEATURE #4: AUTO-GENERATED REST APIs (READ)
  // ===============================================
  
  const fetchData = async () => {
    try {
      console.log('📥 Fetching data with Supabase auto-generated APIs...')
      
      // READ: Get all boards for current user (RLS automatically filters)
      const { data: boards, error: boardsError } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })

      if (boardsError) throw boardsError

      // If no boards exist, create sample data
      if (!boards || boards.length === 0) {
        await createSampleData()
        return
      }

      // Get the first board
      const firstBoard = boards[0]
      setCurrentBoard(firstBoard)
      
      // READ: Get lists for this board
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', firstBoard.id)
        .order('position', { ascending: true })

      if (listsError) throw listsError

      // READ: Get cards for these lists
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('list_id', lists.map(list => list.id))
        .order('position', { ascending: true })

      if (cardsError) throw cardsError

      setData({ boards: boards || [], lists: lists || [], cards: cards || [] })
      console.log('✅ Data fetched successfully!')
      
    } catch (error) {
      console.error('❌ Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===============================================
  // 🎯 FEATURE #6: EDGE FUNCTIONS (Serverless)
  // ===============================================
  
  const triggerCompletionNotification = async ({ cardId, cardTitle, listTitle, userEmail }: {
    cardId: string
    cardTitle: string  
    listTitle: string
    userEmail: string
  }) => {
    try {
      console.log('🚀 Calling edge function for task completion...')
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('task-completion-notification', {
        body: { cardId, cardTitle, listTitle, userEmail }
      })

      if (error) {
        console.error('❌ Edge function error:', error)
        showNotification(`Failed to send notification: ${error.message}`, 'error')
        return
      }

      if (data?.success) {
        console.log('🎉 Notification sent:', data.message)
        showNotification(`🎉 Notification sent for "${cardTitle}"!`, 'success')
      }
    } catch (error) {
      console.error('❌ Error calling edge function:', error)
      showNotification('Failed to send notification', 'error')
    }
  }

  // 🎉 Show UI notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type })
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // ===============================================
  // 🎯 FEATURE #4: AUTO-GENERATED REST APIs (CREATE)
  // ===============================================

  const createSampleData = async () => {
    try {
      console.log('🌱 Creating sample data for new user...')
      
      // CREATE: New board
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          title: 'My First Board',
          description: 'A sample Kanban board to get you started',
          user_id: user?.id // RLS ensures only this user can see it
        })
        .select()
        .single()

      if (boardError) throw boardError

      // CREATE: Sample lists
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .insert([
          { title: 'To Do', board_id: board.id, position: 1 },
          { title: 'In Progress', board_id: board.id, position: 2 },
          { title: 'Done', board_id: board.id, position: 3 }
        ])
        .select()

      if (listsError) throw listsError

      // CREATE: Sample cards
      const todoListId = lists.find(list => list.title === 'To Do')?.id
      const inProgressListId = lists.find(list => list.title === 'In Progress')?.id

      if (todoListId && inProgressListId) {
        await supabase
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
      }

      console.log('✅ Sample data created!')
      fetchData() // Refresh data
    } catch (error) {
      console.error('❌ Error creating sample data:', error)
    }
  }

  const addCard = async (listId: string) => {
    const cardTitle = newCardTitles[listId]?.trim()
    if (!cardTitle) return

    console.log('➕ Adding new card:', cardTitle)

    // Optimistic Update: Update UI immediately
    const tempId = `temp-${Date.now()}`
    const optimisticCard = {
      id: tempId,
      title: cardTitle,
      description: null,
      list_id: listId,
      position: data.cards.filter(card => card.list_id === listId).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setData(prevData => ({
      ...prevData,
      cards: [...prevData.cards, optimisticCard]
    }))

    setNewCardTitles(prev => ({ ...prev, [listId]: '' }))

    try {
      // CREATE: Save to database
      const { data: insertedCard, error } = await supabase
        .from('cards')
        .insert({
          title: cardTitle,
          list_id: listId,
          position: optimisticCard.position
        })
        .select()
        .single()

      if (error) throw error

      // Replace optimistic card with real card
      setData(prevData => ({
        ...prevData,
        cards: prevData.cards.map(card => 
          card.id === tempId ? insertedCard : card
        )
      }))

      console.log('✅ Card added successfully!')
    } catch (error) {
      console.error('❌ Error adding card:', error)
      // Rollback optimistic update
      setData(prevData => ({
        ...prevData,
        cards: prevData.cards.filter(card => card.id !== tempId)
      }))
      setNewCardTitles(prev => ({ ...prev, [listId]: cardTitle }))
    }
  }

  const addList = async () => {
    if (!newListTitle.trim() || !currentBoard) return

    console.log('📝 Adding new list:', newListTitle)

    // Optimistic Update
    const tempId = `temp-${Date.now()}`
    const optimisticList = {
      id: tempId,
      title: newListTitle,
      board_id: currentBoard.id,
      position: data.lists.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setData(prevData => ({
      ...prevData,
      lists: [...prevData.lists, optimisticList]
    }))

    const listTitle = newListTitle
    setNewListTitle('')

    try {
      // CREATE: Save to database
      const { data: insertedList, error } = await supabase
        .from('lists')
        .insert({
          title: listTitle,
          board_id: currentBoard.id,
          position: optimisticList.position
        })
        .select()
        .single()

      if (error) throw error

      // Replace optimistic list with real list
      setData(prevData => ({
        ...prevData,
        lists: prevData.lists.map(list => 
          list.id === tempId ? insertedList : list
        )
      }))

      console.log('✅ List added successfully!')
    } catch (error) {
      console.error('❌ Error adding list:', error)
      // Rollback
      setData(prevData => ({
        ...prevData,
        lists: prevData.lists.filter(list => list.id !== tempId)
      }))
      setNewListTitle(listTitle)
    }
  }

  // ===============================================
  // 🎯 FEATURE #4: AUTO-GENERATED REST APIs (UPDATE)
  // ===============================================

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // Don't do anything if dropped in same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    console.log('🎯 Updating card position with drag & drop...')

    const cardId = draggableId
    const sourceListId = source.droppableId
    const destinationListId = destination.droppableId
    const newPosition = destination.index

    // Optimistic Update: Update UI immediately for smooth UX
    setData(prevData => {
      const newData = { ...prevData }
      const cardToMove = newData.cards.find(card => card.id === cardId)
      
      if (!cardToMove) return prevData

      // Complex position calculation logic...
      const sourceCards = newData.cards.filter(card => 
        card.list_id === sourceListId && card.id !== cardId
      ).sort((a, b) => a.position - b.position)

      sourceCards.forEach((card, index) => {
        card.position = index
      })

      cardToMove.list_id = destinationListId
      cardToMove.position = newPosition

      const destinationCards = newData.cards.filter(card => 
        card.list_id === destinationListId && card.id !== cardId
      ).sort((a, b) => a.position - b.position)

      destinationCards.splice(newPosition, 0, cardToMove)
      destinationCards.forEach((card, index) => {
        card.position = index
      })

      const otherCards = newData.cards.filter(card => 
        card.list_id !== sourceListId && card.list_id !== destinationListId
      )

      newData.cards = [...otherCards, ...sourceCards, ...destinationCards]
      return newData
    })

    try {
      // UPDATE: Save new position to database
      const { error } = await supabase
        .from('cards')
        .update({ 
          list_id: destinationListId, 
          position: newPosition 
        })
        .eq('id', cardId)

      if (error) throw error

      console.log('✅ Card position updated!')

      // 🎯 FEATURE #6: EDGE FUNCTIONS (Serverless)
      // Check if card was moved to "Done" and trigger notification
      const destinationList = data.lists.find(list => list.id === destinationListId)
      const movedCard = data.cards.find(card => card.id === cardId)
      
      if (destinationList && movedCard && user) {
        // 🎉 Only celebrate when moved to "Done"!
        if (destinationList.title === 'Done') {
          const isEdgeFunctionEnabled = true // Set to false to disable
          
          if (isEdgeFunctionEnabled) {
            await triggerCompletionNotification({
              cardId: movedCard.id,
              cardTitle: movedCard.title,
              listTitle: destinationList.title,
              userEmail: user.email || 'user@example.com'
            })
          } else {
            // Demo simulation for local development
            console.log('🎉 DEMO: Task completed notification would be sent!')
            console.log(`📧 Email would be sent to: ${user.email}`)
            console.log(`✅ Task: "${movedCard.title}"`)
            showNotification(`🎉 DEMO: Notification sent for "${movedCard.title}"!`, 'success')
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error updating card position:', error)
      fetchData() // Refresh on error
    }
  }

  // ===============================================
  // 🎯 FEATURE #4: AUTO-GENERATED REST APIs (DELETE)
  // ===============================================

  const deleteCard = async (cardId: string) => {
    console.log('🗑️ Deleting card...')
    
    // Store for potential rollback
    const cardToDelete = data.cards.find(card => card.id === cardId)
    if (!cardToDelete) return

    // Optimistic Update: Remove immediately
    setData(prevData => ({
      ...prevData,
      cards: prevData.cards.filter(card => card.id !== cardId)
    }))

    try {
      // DELETE: Remove from database
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)

      if (error) throw error

      console.log('✅ Card deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting card:', error)
      // Rollback: Restore card
      setData(prevData => ({
        ...prevData,
        cards: [...prevData.cards, cardToDelete].sort((a, b) => a.position - b.position)
      }))
    }
  }

  // ===============================================
  // 🎨 UI COMPONENTS
  // ===============================================

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
      {/* Header with User Info (Feature #1: Authentication) */}
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

      {/* Main Kanban Board */}
      <div className="p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto">
            {/* Render Each List */}
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
                  
                  {/* Droppable area for cards */}
                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-4 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Render Cards */}
                        {data.cards
                          .filter(card => card.list_id === list.id)
                          .map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
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
                        
                        {/* Add Card Form */}
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
            
            {/* Add New List */}
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

      {/* 🎉 Notification Toast (Feature #6: Edge Functions) */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className={`px-6 py-4 rounded-lg shadow-lg border max-w-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <p className="font-medium text-sm">{notification.message}</p>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                className={`ml-auto text-lg leading-none ${
                  notification.type === 'success' 
                    ? 'text-green-600 hover:text-green-800'
                    : 'text-red-600 hover:text-red-800'
                }`}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 