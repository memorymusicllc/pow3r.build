/**
 * A-TEAM System Test Script
 * Simple test to verify A-TEAM system functionality
 */

import ATEAMSystem from './ateam-system.js';

async function testATEAMSystem() {
  console.log('🧪 Testing A-TEAM System...');
  
  try {
    // Create A-TEAM system instance
    const ateamSystem = new ATEAMSystem();
    
    // Test initialization
    console.log('🔧 Initializing A-TEAM System...');
    const initialized = await ateamSystem.initialize();
    
    if (initialized) {
      console.log('✅ A-TEAM System initialized successfully');
      
      // Test system status
      const status = ateamSystem.getSystemStatus();
      console.log('📊 System Status:', status);
      
      // Test constitutional compliance
      const compliance = ateamSystem.getConstitutionalCompliance();
      console.log('⚖️ Constitutional Compliance:', compliance);
      
      // Test simple request processing
      console.log('🎯 Testing request processing...');
      const testRequest = {
        text: 'Test A-TEAM system functionality',
        timestamp: new Date().toISOString(),
        source: 'test'
      };
      
      const result = await ateamSystem.processUserRequest(testRequest);
      console.log('📋 Request Result:', {
        success: result.success,
        workflowId: result.workflowId,
        goalScore: result.goalScore,
        confidence: result.confidence
      });
      
      console.log('✅ A-TEAM System test completed successfully');
      
    } else {
      console.error('❌ A-TEAM System initialization failed');
    }
    
  } catch (error) {
    console.error('❌ A-TEAM System test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testATEAMSystem();


